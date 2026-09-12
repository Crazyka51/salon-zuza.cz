import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { synchronizeProvozniHodinySZamestnanci } from '@/lib/reservations/sync-provozni-hodiny';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';

// GET - načtení zaměstnanců
// ?mode=booking  → vrátí POUZE zaměstnance (bez adminů), pro online rezervaci
// bez parametru  → vrátí všechny aktivní (pro admin panel, včetně adminů)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'booking') {
      // Použijeme $queryRaw aby jsme obešli Prisma typování (sloupec je nový)
      const zamestnanci = await prisma.$queryRaw<
        {
          id: number;
          jmeno: string;
          prijmeni: string;
          uroven: string;
          email: string;
          telefon: string | null;
          fotoUrl: string | null;
          jeAktivni: boolean;
          jeAdmin: boolean;
        }[]
      >`
        SELECT id, jmeno, prijmeni, uroven, email, telefon,
               foto_url AS "fotoUrl", je_aktivni AS "jeAktivni", je_admin AS "jeAdmin"
        FROM zamestnanci
        WHERE je_aktivni = true AND email LIKE '%salon-zuza.cz'
        ORDER BY uroven DESC, jmeno ASC
      `;
      return NextResponse.json({ zamestnanci }, { status: 200 });
    }

    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    const currentUserId = Number(authUser.id);
    if (!Number.isInteger(currentUserId)) {
      return NextResponse.json(
        { error: 'Neplatná session uživatele' },
        { status: 401 }
      );
    }

    const [currentEmployee] = await prisma.$queryRaw<
      {
        id: number;
        jeAdmin: boolean;
        email: string;
      }[]
    >`
      SELECT id, je_admin AS "jeAdmin", email
      FROM zamestnanci
      WHERE id = ${currentUserId} AND je_aktivni = true
      LIMIT 1
    `;

    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Uživatel nebyl nalezen nebo je neaktivní' },
        { status: 403 }
      );
    }

    if (currentEmployee.jeAdmin) {
      // Admin pohled - všichni aktivní zaměstnanci včetně adminů
      // Filtr: Zuzana neuvidí Matěje Hrabáka (pro čistší UI)
      const zamestnanci = await prisma.$queryRaw<
        {
          id: number;
          jmeno: string;
          prijmeni: string;
          uroven: string;
          email: string;
          telefon: string | null;
          fotoUrl: string | null;
          jeAktivni: boolean;
          jeAdmin: boolean;
          rozvrh: unknown;
          dnyVolna: string[];
        }[]
      >`
        SELECT id, jmeno, prijmeni, uroven, email, telefon,
               foto_url AS "fotoUrl", je_aktivni AS "jeAktivni", je_admin AS "jeAdmin",
               rozvrh, dny_volna AS "dnyVolna"
        FROM zamestnanci
        WHERE je_aktivni = true
        ORDER BY uroven DESC, jmeno ASC
      `;

      const viditelniZamestnanci =
        currentEmployee.email === 'zuzka@salon-zuza.cz'
          ? zamestnanci.filter(
              (zamestnanec) =>
                !(
                  zamestnanec.jmeno === 'Matěj' &&
                  zamestnanec.prijmeni === 'Hrabák'
                )
            )
          : zamestnanci;

      return NextResponse.json(
        { zamestnanci: viditelniZamestnanci },
        { status: 200 }
      );
    }

    // Non-admin pohled - sám sebe + explicitně povolení zaměstnanci z employee_visibility
    const zamestnanci = await prisma.$queryRaw<
      {
        id: number;
        jmeno: string;
        prijmeni: string;
        uroven: string;
        email: string;
        telefon: string | null;
        fotoUrl: string | null;
        jeAktivni: boolean;
        jeAdmin: boolean;
        rozvrh: unknown;
        dnyVolna: string[];
      }[]
    >`
      SELECT id, jmeno, prijmeni, uroven, email, telefon,
             foto_url AS "fotoUrl", je_aktivni AS "jeAktivni", je_admin AS "jeAdmin",
             rozvrh, dny_volna AS "dnyVolna"
      FROM zamestnanci
      WHERE je_aktivni = true
        AND (
          id = ${currentUserId}
          OR EXISTS (
            SELECT 1
            FROM employee_visibility ev
            WHERE ev.viewer_employee_id = ${currentUserId}
              AND ev.target_employee_id = zamestnanci.id
              AND ev.je_aktivni = true
          )
        )
      ORDER BY uroven DESC, jmeno ASC
    `;

    return NextResponse.json({ zamestnanci }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání zaměstnanců:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst zaměstnance' },
      { status: 500 }
    );
  }
}

// POST - vytvoření nového zaměstnance
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const zamestnanec = await prisma.zamestnanec.create({
      data: {
        jmeno: data.jmeno,
        prijmeni: data.prijmeni,
        uroven: data.uroven,
        email: data.email,
        telefon: data.telefon || null,
        fotoUrl: data.fotoUrl || null,
        rozvrh: data.rozvrh || null,
        dnyVolna: data.dnyVolna || [],
        jeAktivni: true,
      },
    });

    if (data.rozvrh) {
      await synchronizeProvozniHodinySZamestnanci();
    }

    return NextResponse.json({ zamestnanec }, { status: 201 });
  } catch (error) {
    console.error('Chyba při vytváření zaměstnance:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit zaměstnance' },
      { status: 500 }
    );
  }
}