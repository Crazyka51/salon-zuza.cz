import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';

// GET - načtení všech blokovaných termínů (veřejné, používá rezervační formulář)
export async function GET(request: NextRequest) {
  try {
    const blokovaneTerminy: any[] = await prisma.$queryRaw`
      WITH employee_vacations AS (
        SELECT
          (-1 * (z.id * 100000 + v.ordinality))::int AS id,
          ('Volno: ' || z.jmeno || ' ' || z.prijmeni) AS nazev,
          CASE
            WHEN POSITION('|' IN v.entry) > 0 THEN ('Částečné volno ' || SPLIT_PART(SPLIT_PART(v.entry, '|', 2), '-', 1) || '-' || SPLIT_PART(SPLIT_PART(v.entry, '|', 2), '-', 2))
            ELSE 'Volno zaměstnance'
          END AS popis,
          (TO_DATE(SPLIT_PART(v.entry, '|', 1), 'YYYY-MM-DD'))::timestamp AS "datumOd",
          (TO_DATE(SPLIT_PART(v.entry, '|', 1), 'YYYY-MM-DD'))::timestamp AS "datumDo",
          true AS "jeAktivni",
          z.created_at AS "createdAt",
          z.updated_at AS "updatedAt",
          'employee-vacation'::text AS source
        FROM zamestnanci z
        CROSS JOIN LATERAL UNNEST(COALESCE(z.dny_volna, ARRAY[]::text[])) WITH ORDINALITY AS v(entry, ordinality)
        WHERE z.je_aktivni = true
          AND z.uroven = 'top_stylist'
          AND SPLIT_PART(v.entry, '|', 1) ~ '^\\d{4}-\\d{2}-\\d{2}$'
      ),
      manual_blocks AS (
        SELECT
          id,
          nazev,
          popis,
          datum_od as "datumOd",
          datum_do as "datumDo",
          je_aktivni as "jeAktivni",
          created_at as "createdAt",
          updated_at as "updatedAt",
          'manual'::text AS source
        FROM blokovane_terminy
        WHERE je_aktivni = true
      )
      SELECT *
      FROM (
        SELECT * FROM manual_blocks
        UNION ALL
        SELECT * FROM employee_vacations
      ) combined
      ORDER BY "datumOd" ASC;
    `;

    return NextResponse.json({ 
      success: true, 
      blokovaneTerminy 
    });
  } catch (error) {
    console.error('Chyba při načítání blokovaných termínů:', error);
    return NextResponse.json(
      { success: false, message: 'Chyba při načítání blokovaných termínů' },
      { status: 500 }
    );
  }
}

// POST - vytvoření nového blokovaného termínu
export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Nejste přihlášeni' }, { status: 401 });
    }

    const body = await request.json();
    const { nazev, popis, datumOd, datumDo } = body;

    // Validace
    if (!nazev || !datumOd || !datumDo) {
      return NextResponse.json(
        { success: false, message: 'Chybí povinné údaje (název, datum od, datum do)' },
        { status: 400 }
      );
    }

    // Kontrola, zda není datum od po datu do
    const dateOd = new Date(datumOd);
    const dateDo = new Date(datumDo);
    
    if (dateOd > dateDo) {
      return NextResponse.json(
        { success: false, message: 'Datum od nemůže být po datu do' },
        { status: 400 }
      );
    }

    // Vytvoření nového blokovaného termínu
    const result: any[] = await prisma.$queryRaw`
      INSERT INTO blokovane_terminy (nazev, popis, datum_od, datum_do, je_aktivni, created_at, updated_at)
      VALUES (${nazev}, ${popis}, ${dateOd}, ${dateDo}, true, NOW(), NOW())
      RETURNING id, nazev, popis, datum_od as "datumOd", datum_do as "datumDo", 
                je_aktivni as "jeAktivni", created_at as "createdAt", updated_at as "updatedAt";
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Blokovaný termín úspěšně vytvořen',
      blokovanyTermin: result[0] 
    });

  } catch (error) {
    console.error('Chyba při vytváření blokovaného termínu:', error);
    return NextResponse.json(
      { success: false, message: 'Chyba při vytváření blokovaného termínu' },
      { status: 500 }
    );
  }
}