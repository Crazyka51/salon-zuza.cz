// API endpoint pro správu jednotlivých služeb
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// POST - vytvořit novou službu
export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validace
    if (!data.nazev || !data.kategorieId) {
      return NextResponse.json(
        { uspech: false, chyba: 'Povinná pole: nazev, kategorieId' },
        { status: 400 }
      )
    }

    // Zjisti maximální pořadí v kategorii
    const maxPoradi = await prisma.sluzba.aggregate({
      where: { kategorieId: parseInt(data.kategorieId) },
      _max: { poradi: true }
    })

    const novaSluzba = await prisma.sluzba.create({
      data: {
        nazev: data.nazev,
        popis: data.popis || null,
        cenaTopStylist: data.cenaTopStylist || 0,
        cenaStylist: data.cenaStylist || 0,
        cenaJuniorStylist: data.cenaJuniorStylist || 0,
        dobaTrvaniMinuty: data.dobaTrvaniMinuty || 60,
        poradi: (maxPoradi._max.poradi || 0) + 1,
        jeAktivni: data.jeAktivni !== false,
        kategorieId: parseInt(data.kategorieId)
      }
    })

    return NextResponse.json({
      uspech: true,
      data: novaSluzba,
      zprava: 'Služba byla vytvořena'
    })
    
  } catch (error) {
    console.error('Admin chyba při vytváření služby:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při vytváření služby' },
      { status: 500 }
    )
  }
}
