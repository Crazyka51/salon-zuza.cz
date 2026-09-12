import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { zkontrolovatDostupnost } from '../../../../lib/reservations/availability';
import { BLOKUJICI_STAVY } from '../../../../lib/reservations/stav';

const SLOT_INTERVAL_MINUTES = 45;

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date
    : null;
}

// Převod HH:MM na minuty od půlnoci
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Minuty na HH:MM
function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Vygeneruj sloty po SLOT_INTERVAL_MINUTES minutách a zkontroluj překryv s rezervacemi.
// Slot je obsazený pokud interval [slotStart, slotStart + serviceDuration) překrývá
// jakoukoliv existující rezervaci [rezStart, rezEnd).
function generateTimeSlots(
  startTime: string,
  endTime: string,
  serviceDurationMinutes: number,
  existingReservations: { casOd: string; casDo: string }[]
): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  const openMinutes = toMinutes(startTime);
  const closeMinutes = toMinutes(endTime);
  // Poslední možný začátek: musí se celá služba vejít před zavírací čas
  const lastStart = closeMinutes - serviceDurationMinutes;

  for (let t = openMinutes; t <= lastStart; t += SLOT_INTERVAL_MINUTES) {
    const slotEnd = t + serviceDurationMinutes;
    const isAvailable = !existingReservations.some(rez => {
      const rezStart = toMinutes(rez.casOd);
      const rezEnd = toMinutes(rez.casDo);
      // Překryv: [t, slotEnd) ∩ [rezStart, rezEnd) ≠ ∅
      return t < rezEnd && slotEnd > rezStart;
    });
    slots.push({ time: fromMinutes(t), available: isAvailable });
  }

  return slots;
}

// GET - získání dostupných termínů pro daný den
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datum = searchParams.get('datum');
    const zamestnanecId = searchParams.get('zamestnanecId');
    const sluzbaId = searchParams.get('sluzbaId');
    const trvaniMinutParam = searchParams.get('trvaniMinut');

    if (!datum) {
      return NextResponse.json(
        { error: 'Datum je povinný parametr' },
        { status: 400 }
      );
    }

    // Kontrola validity data
    const selectedDate = parseDateOnly(datum);
    if (!selectedDate) {
      return NextResponse.json(
        { error: 'Neplatný formát data' },
        { status: 400 }
      );
    }

    const dayOfWeek = selectedDate.getDay(); // 0 = neděle, 1 = pondělí, ...

    // Načtení provozních hodin pro daný den
    const provozniHodiny = await prisma.provozniHodiny.findUnique({
      where: { denTydne: dayOfWeek },
    });

    if (!provozniHodiny || provozniHodiny.jeZavreno || !provozniHodiny.jeAktivni) {
      return NextResponse.json({
        datum,
        dostupneTerminy: [],
        provozniHodiny: null,
        zprava: 'Salon má v tento den zavřeno',
      });
    }

    // Načtení existujících rezervací pro daný den
    // Pokryjeme celý lokální den: od 00:00 do 23:59:59 dle ISO řetězce
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const whereCondition: any = {
      datum: {
        gte: startOfDay,
        lte: endOfDay,
      },
      // Pending (čeká na potvrzení) neblokuje sloty.
      stav: {
        in: [...BLOKUJICI_STAVY],
      },
    };

    if (zamestnanecId) {
      whereCondition.zamestnanecId = parseInt(zamestnanecId);
    }

    const existujiciRezervace = await prisma.rezervace.findMany({
      where: whereCondition,
      select: {
        casOd: true,
        casDo: true,
        zamestnanecId: true,
      },
    });

    // Určení doby trvání - preferujeme přímý parametr trvaniMinut (součet více služeb)
    let dobaTrvaniMinuty = SLOT_INTERVAL_MINUTES; // výchozí = 1 slot
    if (trvaniMinutParam) {
      const parsed = parseInt(trvaniMinutParam);
      if (!isNaN(parsed) && parsed > 0) dobaTrvaniMinuty = parsed;
    } else if (sluzbaId) {
      const sluzba = await prisma.sluzba.findUnique({
        where: { id: parseInt(sluzbaId) },
        select: { dobaTrvaniMinuty: true },
      });
      if (sluzba) {
        dobaTrvaniMinuty = sluzba.dobaTrvaniMinuty;
      }
    }

    // Generování a filtrování časových slotů - jediný průchod
    let filtrovaneTerminy = generateTimeSlots(
      provozniHodiny.casOtevrani,
      provozniHodiny.casZavreni,
      dobaTrvaniMinuty,
      existujiciRezervace
    );

    // **NOVÁ KONTROLA:** Pokud je specifikován konkrétní zaměstnanec, ověřit jeho dostupnost
    // včetně plánu, dovolené a pracovní doby (ne jen konflikty s existujícími rezervacemi)
    if (zamestnanecId) {
      const finalAvailableSlots = [];
      const zamestnanecIdNum = parseInt(zamestnanecId);

      for (const slot of filtrovaneTerminy) {
        try {
          // Vypočítejte čas konce služby
          const [slotHour, slotMinute] = slot.time.split(':').map(Number);
          const endTimeMinutes = slotHour * 60 + slotMinute + dobaTrvaniMinuty;
          const endHour = Math.floor(endTimeMinutes / 60);
          const endMinute = endTimeMinutes % 60;
          const casKonci = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

          // Ověřit dostupnost zaměstnance pro celou dobu služby
          const dostupnost = await zkontrolovatDostupnost(
            zamestnanecIdNum,
            datum,
            slot.time,
            casKonci
          );

          if (dostupnost) {
            finalAvailableSlots.push(slot);
          }
        } catch (error) {
          console.error(`Chyba při kontrole dostupnosti pro slot ${slot.time}:`, error);
          // Pokud selže kontrola, slot není dostupný (fail-safe)
        }
      }

      filtrovaneTerminy = finalAvailableSlots;
    }

    // Načtení informací o zaměstnancích (pokud není specifikován konkrétní)
    let dostupniZamestnanci: any[] = [];
    if (!zamestnanecId) {
      dostupniZamestnanci = await prisma.zamestnanec.findMany({
        where: { jeAktivni: true },
        select: {
          id: true,
          jmeno: true,
          prijmeni: true,
          uroven: true,
        },
      });

      // Bez výběru konkrétního zaměstnance musí být slot dostupný alespoň pro
      // JEDNOHO aktivního zaměstnance (jinak by prošel i den, kdy mají volno všichni).
      const aktivniIds = dostupniZamestnanci.map((z) => z.id);
      const finalAvailableSlots = [];

      for (const slot of filtrovaneTerminy) {
        if (!slot.available) continue;

        const [slotHour, slotMinute] = slot.time.split(':').map(Number);
        const endTimeMinutes = slotHour * 60 + slotMinute + dobaTrvaniMinuty;
        const endHour = Math.floor(endTimeMinutes / 60);
        const endMinute = endTimeMinutes % 60;
        const casKonci = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

        let jeDostupnyNekdo = false;
        for (const zId of aktivniIds) {
          try {
            if (await zkontrolovatDostupnost(zId, datum, slot.time, casKonci)) {
              jeDostupnyNekdo = true;
              break;
            }
          } catch (error) {
            console.error(`Chyba při kontrole dostupnosti zaměstnance ${zId} pro slot ${slot.time}:`, error);
          }
        }

        if (jeDostupnyNekdo) {
          finalAvailableSlots.push(slot);
        }
      }

      filtrovaneTerminy = finalAvailableSlots;
    }

    return NextResponse.json({
      datum,
      dostupneTerminy: filtrovaneTerminy,
      provozniHodiny: {
        casOtevrani: provozniHodiny.casOtevrani,
        casZavreni: provozniHodiny.casZavreni,
        denTydne: dayOfWeek,
      },
      dobaTrvaniSluzby: dobaTrvaniMinuty,
      dostupniZamestnanci,
    });

  } catch (error) {
    console.error('Chyba při načítání dostupných termínů:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst dostupné termíny' },
      { status: 500 }
    );
  }
}