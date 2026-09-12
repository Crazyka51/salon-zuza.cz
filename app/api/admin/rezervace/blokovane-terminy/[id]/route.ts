import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';

// PUT - aktualizace blokovaného termínu
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Nejste přihlášeni' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID termínu' },
        { status: 400 }
      );
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

    // Kontrola data
    const dateOd = new Date(datumOd);
    const dateDo = new Date(datumDo);
    
    if (dateOd > dateDo) {
      return NextResponse.json(
        { success: false, message: 'Datum od nemůže být po datu do' },
        { status: 400 }
      );
    }

    // Aktualizace v databázi
    const result = await prisma.$executeRaw`
      UPDATE blokovane_terminy 
      SET nazev = ${nazev}, popis = ${popis}, datum_od = ${dateOd}, datum_do = ${dateDo}, updated_at = NOW()
      WHERE id = ${id} AND je_aktivni = true;
    `;

    if (result === 0) {
      return NextResponse.json(
        { success: false, message: 'Termín nenalezen nebo už byl smazán' },
        { status: 404 }
      );
    }

    // Načtení aktualizovaného záznamu
    const updatedRecord: any[] = await prisma.$queryRaw`
      SELECT id, nazev, popis, datum_od as "datumOd", datum_do as "datumDo", 
             je_aktivni as "jeAktivni", created_at as "createdAt", updated_at as "updatedAt"
      FROM blokovane_terminy 
      WHERE id = ${id};
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Blokovaný termín úspěšně aktualizován',
      blokovanyTermin: updatedRecord[0] 
    });

  } catch (error) {
    console.error('Chyba při aktualizaci blokovaného termínu:', error);
    return NextResponse.json(
      { success: false, message: 'Chyba při aktualizaci blokovaného termínu' },
      { status: 500 }
    );
  }
}

// DELETE - smazání blokovaného termínu (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Nejste přihlášeni' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID termínu' },
        { status: 400 }
      );
    }

    // Soft delete - nastavení je_aktivni na false
    const result = await prisma.$executeRaw`
      UPDATE blokovane_terminy 
      SET je_aktivni = false, updated_at = NOW()
      WHERE id = ${id} AND je_aktivni = true;
    `;

    if (result === 0) {
      return NextResponse.json(
        { success: false, message: 'Termín nenalezen nebo už byl smazán' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Blokovaný termín úspěšně smazán' 
    });

  } catch (error) {
    console.error('Chyba při mazání blokovaného termínu:', error);
    return NextResponse.json(
      { success: false, message: 'Chyba při mazání blokovaného termínu' },
      { status: 500 }
    );
  }
}

// GET - načtení konkrétního blokovaného termínu
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Nejste přihlášeni' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID termínu' },
        { status: 400 }
      );
    }

    const record: any[] = await prisma.$queryRaw`
      SELECT id, nazev, popis, datum_od as "datumOd", datum_do as "datumDo", 
             je_aktivni as "jeAktivni", created_at as "createdAt", updated_at as "updatedAt"
      FROM blokovane_terminy 
      WHERE id = ${id} AND je_aktivni = true;
    `;

    if (record.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Termín nenalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      blokovanyTermin: record[0] 
    });

  } catch (error) {
    console.error('Chyba při načítání blokovaného termínu:', error);
    return NextResponse.json(
      { success: false, message: 'Chyba při načítání blokovaného termínu' },
      { status: 500 }
    );
  }
}