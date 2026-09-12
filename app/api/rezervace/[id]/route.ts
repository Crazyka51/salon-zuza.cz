import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendReservationNotifications } from '../../../../lib/notifications';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';
import { STAV, BLOKUJICI_STAVY } from '../../../../lib/reservations/stav';

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

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - načtení konkrétní rezervace (pouze pro přihlášené administrátory/zaměstnance)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID rezervace' },
        { status: 400 }
      );
    }

    const rezervace = await prisma.rezervace.findUnique({
      where: { id },
      include: {
        sluzba: {
          include: {
            kategorie: true,
          },
        },
        zamestnanec: true,
      },
    });

    if (!rezervace) {
      return NextResponse.json(
        { error: 'Rezervace nenalezena' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rezervace }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání rezervace:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst rezervaci' },
      { status: 500 }
    );
  }
}

// PUT - aktualizace rezervace (pouze pro přihlášené administrátory/zaměstnance)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID rezervace' },
        { status: 400 }
      );
    }

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
      zamestnanecId,
      poznamka,
      stav,
      cena,
      zpusobPlatby,
      notifikaceEmail,
      notifikaceSms,
    } = data;

    // Kontrola existence rezervace
    const existujiciRezervace = await prisma.rezervace.findUnique({
      where: { id },
    });

    if (!existujiciRezervace) {
      return NextResponse.json(
        { error: 'Rezervace nenalezena' },
        { status: 404 }
      );
    }

    // Validace emailu, pokud je poskytnut
    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Neplatný formát emailu' },
        { status: 400 }
      );
    }

    // Validace časů, pokud jsou poskytnuty
    if (casOd && !validateTime(casOd)) {
      return NextResponse.json(
        { error: 'Neplatný formát času začátku (použijte HH:MM)' },
        { status: 400 }
      );
    }

    if (casDo && !validateTime(casDo)) {
      return NextResponse.json(
        { error: 'Neplatný formát času konce (použijte HH:MM)' },
        { status: 400 }
      );
    }

    // Pokud se mění doba rezervace, zkontroluj konflikty
    const vyslednyStav = stav ?? existujiciRezervace.stav;

    if ((datum || casOd || casDo || zamestnanecId !== undefined) &&
      BLOKUJICI_STAVY.includes(vyslednyStav)) {
      
      const noveDatum = datum ? new Date(datum) : existujiciRezervace.datum;
      const novyCasOd = casOd || existujiciRezervace.casOd;
      const novyCasDo = casDo || existujiciRezervace.casDo;
      const novyZamestnanecId = zamestnanecId !== undefined ? zamestnanecId : existujiciRezervace.zamestnanecId;

      // Kontrola, zda čas od je před časem do
      if (novyCasOd >= novyCasDo) {
        return NextResponse.json(
          { error: 'Čas začátku musí být před časem konce' },
          { status: 400 }
        );
      }

      // Kontrola konfliktu s jinými rezervacemi
      const konfliktniRezervace = await prisma.rezervace.findMany({
        where: {
          id: { not: id }, // kromě aktuální rezervace
          datum: noveDatum,
          zamestnanecId: novyZamestnanecId,
          stav: {
            in: [...BLOKUJICI_STAVY],
          },
          OR: [
            {
              AND: [
                { casOd: { lte: novyCasOd } },
                { casDo: { gt: novyCasOd } },
              ],
            },
            {
              AND: [
                { casOd: { lt: novyCasDo } },
                { casDo: { gte: novyCasDo } },
              ],
            },
            {
              AND: [
                { casOd: { gte: novyCasOd } },
                { casDo: { lte: novyCasDo } },
              ],
            },
          ],
        },
      });

      if (konfliktniRezervace.length > 0) {
        return NextResponse.json(
          { error: 'V daném čase již existuje jiná rezervace' },
          { status: 409 }
        );
      }
    }

    // Aktualizace rezervace
    const aktualizovanaRezervace = await prisma.rezervace.update({
      where: { id },
      data: {
        ...(jmeno && { jmeno }),
        ...(prijmeni && { prijmeni }),
        ...(email && { email }),
        ...(telefon && { telefon }),
        ...(datum && { datum: new Date(datum) }),
        ...(casOd && { casOd }),
        ...(casDo && { casDo }),
        ...(sluzbaId !== undefined && { sluzbaId }),
        ...(zamestnanecId !== undefined && { zamestnanecId }),
        ...(poznamka !== undefined && { poznamka }),
        ...(stav && { stav }),
        ...(cena !== undefined && { cena }),
        ...(zpusobPlatby && { zpusobPlatby }),
        ...(notifikaceEmail !== undefined && { notifikaceEmail }),
        ...(notifikaceSms !== undefined && { notifikaceSms }),
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

    // Odeslání notifikací při změně stavu (asynchronně)
    if (stav && stav !== existujiciRezervace.stav) {
      const updatedReservation = {
        ...aktualizovanaRezervace,
        previousStatus: existujiciRezervace.stav,
      };
      sendReservationNotifications(updatedReservation, 'updated').catch(error => {
        console.error('Chyba při odesílání notifikací:', error);
      });
    }

    return NextResponse.json({ rezervace: aktualizovanaRezervace }, { status: 200 });
  } catch (error) {
    console.error('Chyba při aktualizaci rezervace:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat rezervaci' },
      { status: 500 }
    );
  }
}

// DELETE - smazání rezervace (pouze pro přihlášené administrátory/zaměstnance)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID rezervace' },
        { status: 400 }
      );
    }

    // Kontrola existence rezervace
    const existujiciRezervace = await prisma.rezervace.findUnique({
      where: { id },
    });

    if (!existujiciRezervace) {
      return NextResponse.json(
        { error: 'Rezervace nenalezena' },
        { status: 404 }
      );
    }

    // Načtení kompletních dat pro notifikaci před smazáním
    const rezervaceProNotifikaci = await prisma.rezervace.findUnique({
      where: { id },
      include: {
        sluzba: {
          include: {
            kategorie: true,
          },
        },
        zamestnanec: true,
      },
    });

    // Smazání rezervace
    await prisma.rezervace.delete({
      where: { id },
    });

    // Odeslání notifikace o zrušení (asynchronně)
    if (rezervaceProNotifikaci) {
      const cancelledReservation = {
        ...rezervaceProNotifikaci,
        previousStatus: rezervaceProNotifikaci.stav,
        stav: STAV.ZRUSENO_SALONEM,
      };
      sendReservationNotifications(cancelledReservation, 'cancelled').catch(error => {
        console.error('Chyba při odesílání notifikací:', error);
      });
    }

    return NextResponse.json(
      { message: 'Rezervace byla úspěšně smazána' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při mazání rezervace:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se smazat rezervaci' },
      { status: 500 }
    );
  }
}