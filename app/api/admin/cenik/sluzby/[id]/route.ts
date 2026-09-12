// API endpoint pro správu konkrétní služby
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// PUT - aktualizovat službu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const data = await request.json()
    
    const aktualizovanaSluzba = await prisma.sluzba.update({
      where: { id },
      data: {
        nazev: data.nazev,
        popis: data.popis || null,
        cenaTopStylist: data.cenaTopStylist || 0,
        cenaStylist: data.cenaStylist || 0,
        cenaJuniorStylist: data.cenaJuniorStylist || 0,
        dobaTrvaniMinuty: data.dobaTrvaniMinuty || 60,
        jeAktivni: data.jeAktivni !== false,
      }
    })

    return NextResponse.json({
      uspech: true,
      data: aktualizovanaSluzba,
      zprava: 'Služba byla aktualizována'
    })
    
  } catch (error) {
    console.error('Admin chyba při aktualizaci služby:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při aktualizaci služby' },
      { status: 500 }
    )
  }
}

// PATCH - částečná aktualizace (např. jen jeAktivni)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const data = await request.json()

    const aktualizovanaSluzba = await prisma.sluzba.update({
      where: { id },
      data: {
        ...(data.jeAktivni !== undefined && { jeAktivni: data.jeAktivni }),
        ...(data.poradi !== undefined && { poradi: data.poradi }),
        ...(data.cenaTopStylist !== undefined && { cenaTopStylist: data.cenaTopStylist }),
        ...(data.cenaStylist !== undefined && { cenaStylist: data.cenaStylist }),
        ...(data.cenaJuniorStylist !== undefined && { cenaJuniorStylist: data.cenaJuniorStylist }),
      }
    })

    return NextResponse.json({ uspech: true, data: aktualizovanaSluzba })
  } catch (error) {
    console.error('Chyba při částečné úpravě služby:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při úpravě služby' },
      { status: 500 }
    )
  }
}

// DELETE - smazat službu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    await prisma.sluzba.delete({
      where: { id }
    })

    return NextResponse.json({
      uspech: true,
      zprava: 'Služba byla smazána'
    })
    
  } catch (error) {
    console.error('Admin chyba při mazání služby:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při mazání služby' },
      { status: 500 }
    )
  }
}
