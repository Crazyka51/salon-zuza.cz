import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// PUT - aktualizovat pořadí kategorií po drag & drop
export async function PUT(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { kategorie } = await request.json()

    if (!Array.isArray(kategorie) || kategorie.length === 0) {
      return NextResponse.json(
        { uspech: false, chyba: 'Chybí seznam kategorií' },
        { status: 400 }
      )
    }

    // Aktualizuj poradi pro každou kategorii podle pozice v poli
    await prisma.$transaction(
      kategorie.map((k: { id: number }, index: number) =>
        prisma.kategorieSluzeb.update({
          where: { id: k.id },
          data: { poradi: index + 1 }
        })
      )
    )

    return NextResponse.json({ uspech: true, zprava: 'Pořadí bylo aktualizováno' })
  } catch (error) {
    console.error('Chyba při aktualizaci pořadí kategorií:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při aktualizaci pořadí' },
      { status: 500 }
    )
  }
}
