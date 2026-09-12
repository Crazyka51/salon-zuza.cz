// API endpoint pro správu pořadí služeb (drag & drop)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// PUT - aktualizovat pořadí služeb po drag & drop
export async function PUT(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const data = await request.json()
    const { sluzby, kategorieId } = data

    if (!Array.isArray(sluzby) || !kategorieId) {
      return NextResponse.json(
        { uspech: false, chyba: 'Chybí seznam služeb nebo ID kategorie' },
        { status: 400 }
      )
    }

    // Aktualizuj poradi pro každou službu podle pozice v poli
    await prisma.$transaction(
      sluzby.map((s: { id: number }, index: number) =>
        prisma.sluzba.update({
          where: { id: s.id },
          data: { poradi: index }
        })
      )
    )

    return NextResponse.json({ 
      uspech: true, 
      zprava: 'Pořadí služeb bylo aktualizováno' 
    })
  } catch (error) {
    console.error('Chyba při aktualizaci pořadí služeb:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při aktualizaci pořadí' },
      { status: 500 }
    )
  }
}
