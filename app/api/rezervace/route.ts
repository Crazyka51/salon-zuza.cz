import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendReservationNotifications } from '../../../lib/notifications';
import { zkontrolovatDostupnost } from '../../../lib/reservations/availability';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';
import { STAV, BLOKUJICI_STAVY } from '../../../lib/reservations/stav';

function formatReservationNumber(id: number): string {
  return `#${id}`;
}

// Validace času ve formátu HH:MM
function validateTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Validace emailu
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET - načtení rezervací (pouze pro přihlášené administrátory/zaměstnance)
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    // Oprav historické rezervace i při běžném načtení administrace.
    // Stav se mění až po skončení celého dne konání, nikoli během dne.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    await prisma.rezervace.updateMany({
      where: {
        datum: { lt: startOfToday },
        stav: { in: [...BLOKUJICI_STAVY] },
      },
      data: { stav: STAV.DOKONCENO },
    });

    const { searchParams } = new URL(request.url);
    const datum = searchParams.get('datum');
    const datumOd = searchParams.get('datum_od');
    const datumDo = searchParams.get('datum_do');
    const zamestnanecId = searchParams.get('zamestnanecId');
    const stav = searchParams.get('stav');

    console.log('[API GET /rezervace] Parametry:', { datum, datumOd, datumDo, zamestnanecId, stav });

    const where: any = {};

    // Support for single date filter
    if (datum) {
      const startOfDay = new Date(datum);
      const endOfDay = new Date(datum);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.datum = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    
    // Support for date range filter (for calendar)
    if (datumOd && datumDo) {
      const startDate = new Date(datumOd);
      const endDate = new Date(datumDo);
      endDate.setHours(23, 59, 59, 999);
      
      where.datum = {
        gte: startDate,
        lte: endDate,
      };
    } else if (datumOd) {
      where.datum = {
        gte: new Date(datumOd),
      };
    } else if (datumDo) {
      const endDate = new Date(datumDo);
      endDate.setHours(23, 59, 59, 999);
      where.datum = {
        lte: endDate,
      };
    }

    if (zamestnanecId) {
      where.zamestnanecId = parseInt(zamestnanecId);
    }

    if (stav) {
      where.stav = stav;
    }

    const rezervace = await prisma.rezervace.findMany({
      where,
      include: {
        sluzba: {
          include: {
            kategorie: true,
          },
        },
        zamestnanec: true,
      },
      orderBy: [
        { datum: 'asc' },
        { casOd: 'asc' },
      ],
    });

    console.log(`[API GET /rezervace] Vráceno ${rezervace.length} rezervací`);
    return NextResponse.json({ rezervace }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání rezervací:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst rezervace' },
      { status: 500 }
    );
  }
}

// POST - vytvoření nové rezervace
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      jmeno,
      prijmeni,
      email,
      telefon,
      datum,
      casOd,
      casDo,
      sluzbaId,
      sluzbyIds, // Nové pole pro více služeb
      sluzbaIds, // Alias z admin formuláře (ReservationForm)
      zamestnanecId,
      pocetOsob = 1,
      pocetDeti = 0,
      poznamka,
      cena,
      zpusobPlatby = 'hotove',
      notifikaceEmail = true,
      notifikaceSms = false,
      adminOverride = false, // Admin může obejít kontrolu pracovní doby
    } = data;

    // Zpětná kompatibilita: přijímá sluzbyIds, sluzbaIds i sluzbaId
    const serviceIds = sluzbyIds || sluzbaIds || (sluzbaId ? [sluzbaId] : []);
    
    console.log('[API POST /rezervace] Nová rezervace:', { 
      jmeno, prijmeni, email, telefon, datum, casOd, casDo, 
      serviceIds, pocetOsob, pocetDeti, adminOverride 
    });

    // Validace povinných polí
    if (!jmeno || !prijmeni || !telefon || !datum || !casOd || !casDo) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // Kontrola, že máme alespoň jednu službu
    if (!serviceIds || serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'Musíte vybrat alespoň jednu službu' },
        { status: 400 }
      );
    }

    const normalizedEmail = typeof email === 'string' ? email.trim() : '';

    // E-mail je nepovinný, ale pokud jej zákazník uvede, ověříme jeho formát.
    if (normalizedEmail && !validateEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Neplatný formát emailu' },
        { status: 400 }
      );
    }

    // Validace časů
    if (!validateTime(casOd) || !validateTime(casDo)) {
      return NextResponse.json(
        { error: 'Neplatný formát času (použijte HH:MM)' },
        { status: 400 }
      );
    }

    // Kontrola, zda čas od je před časem do
    if (casOd >= casDo) {
      return NextResponse.json(
        { error: 'Čas začátku musí být před časem konce' },
        { status: 400 }
      );
    }

    // Načtení informací o službách
    const sluzby = await prisma.sluzba.findMany({
      where: {
        id: {
          in: serviceIds
        }
      }
    });

    if (sluzby.length !== serviceIds.length) {
      return NextResponse.json(
        { error: 'Některé vybrané služby neexistují' },
        { status: 400 }
      );
    }

    // **KONTROLA DOSTUPNOSTI:** Ověření dostupnosti zaměstnance (pokud je specifikován)
    // Admin režim: adminOverride=true přeskočí kontrolu pracovní doby, ale stále kontroluje konflikty
    if (zamestnanecId && !adminOverride) {
      try {
        const dostupnost = await zkontrolovatDostupnost(
          zamestnanecId,
          datum,
          casOd,
          casDo
        );

        if (!dostupnost) {
          return NextResponse.json(
            { 
              error: 'Zaměstnanec není v daném čase dostupný (plán, dovolená nebo přesah s jinou rezervací)',
              code: 'UNAVAILABLE'
            },
            { status: 409 }
          );
        }
      } catch (availabilityError) {
        console.error('Chyba při kontrole dostupnosti zaměstnance:', availabilityError);
        return NextResponse.json(
          { error: 'Nepodařilo se ověřit dostupnost zaměstnance' },
          { status: 500 }
        );
      }
    } else if (zamestnanecId && adminOverride) {
      console.log('[API POST /rezervace] ⚠️ Admin override - přeskakuji kontrolu pracovní doby');
    } else if (!zamestnanecId && !adminOverride) {
      // Bez výběru konkrétního zaměstnance musí být dostupný alespoň jeden aktivní zaměstnanec
      // (jinak by šlo vytvořit rezervaci i v den, kdy mají volno úplně všichni).
      const aktivniZamestnanci = await prisma.zamestnanec.findMany({
        where: { jeAktivni: true },
        select: { id: true },
      });

      let jeDostupnyNekdo = false;
      for (const z of aktivniZamestnanci) {
        try {
          if (await zkontrolovatDostupnost(z.id, datum, casOd, casDo)) {
            jeDostupnyNekdo = true;
            break;
          }
        } catch (availabilityError) {
          console.error(`Chyba při kontrole dostupnosti zaměstnance ${z.id}:`, availabilityError);
        }
      }

      if (!jeDostupnyNekdo) {
        return NextResponse.json(
          {
            error: 'V daném čase není dostupný žádný zaměstnanec (plán, dovolená nebo přesah s jinou rezervací)',
            code: 'UNAVAILABLE'
          },
          { status: 409 }
        );
      }
    }

    // Kontrola konfliktu s existujícími rezervacemi pro celý časový blok
    const existujiciRezervace = await prisma.rezervace.findMany({
      where: {
        datum: new Date(datum),
        zamestnanecId: zamestnanecId || null,
        stav: {
          in: [...BLOKUJICI_STAVY],
        },
        OR: [
          {
            AND: [
              { casOd: { lte: casOd } },
              { casDo: { gt: casOd } },
            ],
          },
          {
            AND: [
              { casOd: { lt: casDo } },
              { casDo: { gte: casDo } },
            ],
          },
          {
            AND: [
              { casOd: { gte: casOd } },
              { casDo: { lte: casDo } },
            ],
          },
        ],
      },
    });

    if (existujiciRezervace.length > 0) {
      return NextResponse.json(
        { error: 'V daném čase již existuje rezervace' },
        { status: 409 }
      );
    }

    // Vytvoření jediné rezervace s celkovým časovým rozsahem a všemi službami
    const celkovaCena = sluzby.reduce((sum, s) => sum + (s.cenaStylist || 0), 0);
    
    // Sestavení seznamu služeb pro poznámku
    const seznamSluzeb = sluzby.map(s => 
      `${s.nazev} (${s.dobaTrvaniMinuty} min, ${s.cenaStylist || 0} Kč)`
    ).join('\n');
    
    let finalniPoznamka = `SLUŽBY:\n${seznamSluzeb}`;
    if (poznamka) {
      finalniPoznamka += `\n\nPOZNÁMKA ZÁKAZNÍKA:\n${poznamka}`;
    }

    const novaRezervace = await prisma.rezervace.create({
      data: {
        jmeno,
        prijmeni,
        // Nasazená databázová/client konfigurace očekává String; prázdný e-mail
        // proto ukládáme jako prázdný řetězec místo null.
        email: normalizedEmail,
        telefon,
        datum: new Date(datum),
        casOd,
        casDo,
        sluzbaId: sluzby[0].id, // Hlavní služba (první vybraná)
        zamestnanecId: zamestnanecId || null,
        pocetOsob,
        pocetDeti,
        poznamka: finalniPoznamka,
        stav: STAV.CEKA_NA_POTVRZENI,
        cena: celkovaCena,
        zpusobPlatby,
        notifikaceEmail,
        notifikaceSms,
        skupinaRezervaci: null, // Jednoduchá rezervace nepotřebuje skupinu
      },
      include: {
        sluzba: {
          include: {
            kategorie: true,
          },
        },
        zamestnanec: true,
      },
    });

    console.log(`[API POST /rezervace] ✅ Rezervace vytvořena - ID: ${novaRezervace.id}, služeb: ${sluzby.length}`);

    // Příprava dat pro email s informacemi o všech službách
    const rezervaceProEmail = {
      ...novaRezervace,
      všechnySlužby: sluzby.map(s => ({
        nazev: s.nazev,
        dobaTrvaniMinuty: s.dobaTrvaniMinuty,
        cena: s.cenaStylist || 0
      })),
      celkováCena: celkovaCena
    };

    // Odeslání notifikací (asynchronně, aby nebrzdilo response)
    sendReservationNotifications(rezervaceProEmail, 'created').catch(error => {
      console.error('Chyba při odesílání notifikací:', error);
    });

    return NextResponse.json({ 
      rezervace: novaRezervace,
      pocetSluzeb: sluzby.length,
      cisloRezervace: formatReservationNumber(novaRezervace.id)
    }, { status: 201 });
  } catch (error) {
    console.error('Chyba při vytváření rezervace:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit rezervaci' },
      { status: 500 }
    );
  }
}

// DELETE - hromadné mazání rezervací (pouze pro přihlášené administrátory/zaměstnance)
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Musíte poskytnout pole ID rezervací k smazání' },
        { status: 400 }
      );
    }

    // Ověření, že všechna ID jsou čísla
    const validIds = ids.filter(id => typeof id === 'number' && id > 0);
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'Nebyly poskytnuty žádné platné ID rezervací' },
        { status: 400 }
      );
    }

    // Smazání rezervací z databáze
    const deletedReservations = await prisma.rezervace.deleteMany({
      where: {
        id: {
          in: validIds
        }
      }
    });

    return NextResponse.json({
      message: `Úspěšně smazáno ${deletedReservations.count} rezervací`,
      deletedCount: deletedReservations.count
    }, { status: 200 });

  } catch (error) {
    console.error('Chyba při mazání rezervací:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se smazat rezervace' },
      { status: 500 }
    );
  }
}