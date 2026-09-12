// API endpoint pro editaci a mazání kategorie
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// PUT - aktualizovat kategorii
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

    if (!data.nazev) {
      return NextResponse.json(
        { uspech: false, chyba: 'Název kategorie je povinný' },
        { status: 400 }
      )
    }

    const aktualizovanaKategorie = await prisma.kategorieSluzeb.update({
      where: { id },
      data: {
        nazev: data.nazev,
        popis: data.popis || null,
        jeAktivni: data.jeAktivni !== false
      },
      include: {
        sluzby: true
      }
    })

    return NextResponse.json({
      uspech: true,
      data: aktualizovanaKategorie,
      zprava: 'Kategorie byla upravena'
    })
    
  } catch (error) {
    console.error('Chyba při úpravě kategorie:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při úpravě kategorie' },
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

    const aktualizovanaKategorie = await prisma.kategorieSluzeb.update({
      where: { id },
      data: {
        ...(data.jeAktivni !== undefined && { jeAktivni: data.jeAktivni }),
        ...(data.nazev !== undefined && { nazev: data.nazev }),
        ...(data.popis !== undefined && { popis: data.popis || null }),
        ...(data.poradi !== undefined && { poradi: data.poradi }),
      }
    })

    return NextResponse.json({ uspech: true, data: aktualizovanaKategorie })
  } catch (error) {
    console.error('Chyba při částečné úpravě kategorie:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při úpravě kategorie' },
      { status: 500 }
    )
  }
}

// DELETE - smazat kategorii
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

    // Zkontroluj, jestli kategorie má služby
    const kategorie = await prisma.kategorieSluzeb.findUnique({
      where: { id },
      include: {
        sluzby: true
      }
    })

    if (!kategorie) {
      return NextResponse.json(
        { uspech: false, chyba: 'Kategorie nebyla nalezena' },
        { status: 404 }
      )
    }

    if (kategorie.sluzby.length > 0) {
      return NextResponse.json(
        { uspech: false, chyba: 'Nelze smazat kategorii se službami. Nejprve smažte všechny služby.' },
        { status: 400 }
      )
    }

    await prisma.kategorieSluzeb.delete({
      where: { id }
    })

    return NextResponse.json({
      uspech: true,
      zprava: 'Kategorie byla smazána'
    })
    
  } catch (error) {
    console.error('Chyba při mazání kategorie:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při mazání kategorie' },
      { status: 500 }
    )
  }
}
