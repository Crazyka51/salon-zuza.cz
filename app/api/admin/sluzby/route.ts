import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - načtení všech služeb pro admin formulář
export async function GET(request: NextRequest) {
  try {
    const sluzby = await prisma.sluzba.findMany({
      where: { jeAktivni: true },
      include: {
        kategorie: {
          select: {
            nazev: true,
          },
        },
      },
      orderBy: [
        { kategorie: { poradi: 'asc' } },
        { nazev: 'asc' },
      ],
    });

    return NextResponse.json({ sluzby }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání služeb:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst služby' },
      { status: 500 }
    );
  }
}

// POST - vytvoření nové služby
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const sluzba = await prisma.sluzba.create({
      data: {
        nazev: data.nazev,
        popis: data.popis,
        dobaTrvaniMinuty: data.dobaTrvaniMinuty,
        cenaTopStylist: data.cenaTopStylist,
        cenaStylist: data.cenaStylist,
        cenaJuniorStylist: data.cenaJuniorStylist,
        kategorieId: data.kategorieId,
        jeAktivni: true,
      },
      include: {
        kategorie: {
          select: {
            nazev: true,
          },
        },
      },
    });

    return NextResponse.json({ sluzba }, { status: 201 });
  } catch (error) {
    console.error('Chyba při vytváření služby:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit službu' },
      { status: 500 }
    );
  }
}