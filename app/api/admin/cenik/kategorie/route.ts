// API endpoint pro správu kategorií služeb
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// GET - načíst všechny kategorie se službami
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const kategorie = await prisma.kategorieSluzeb.findMany({
      include: {
        sluzby: {
          orderBy: { poradi: 'asc' }
        }
      },
      orderBy: { poradi: 'asc' }
    })

    return NextResponse.json({ uspech: true, kategorie })
  } catch (error) {
    console.error('Chyba při načítání kategorií:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při načítání kategorií' },
      { status: 500 }
    )
  }
}

// POST - vytvořit novou kategorii
export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const data = await request.json()
    
    if (!data.nazev) {
      return NextResponse.json(
        { uspech: false, chyba: 'Název kategorie je povinný' },
        { status: 400 }
      )
    }

    // Zjisti maximální pořadí
    const maxPoradi = await prisma.kategorieSluzeb.aggregate({
      _max: { poradi: true }
    })

    const novaKategorie = await prisma.kategorieSluzeb.create({
      data: {
        nazev: data.nazev,
        popis: data.popis || null,
        poradi: (maxPoradi._max.poradi || 0) + 1,
        jeAktivni: data.jeAktivni !== false
      },
      include: {
        sluzby: true
      }
    })

    return NextResponse.json({
      uspech: true,
      data: novaKategorie,
      zprava: 'Kategorie byla vytvořena'
    })
    
  } catch (error) {
    console.error('Chyba při vytváření kategorie:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při vytváření kategorie' },
      { status: 500 }
    )
  }
}
