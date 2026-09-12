// API endpoint pro správu obsahu stránek v adminu
import { NextRequest, NextResponse } from 'next/server'
import { ObsahStrankyModel } from '@/lib/repositories/ObsahStrankyModel'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// GET - získat obsah pro admin
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stranka = searchParams.get('stranka')

    let obsah
    if (stranka) {
      obsah = await ObsahStrankyModel.ziskatPodleStranky(stranka)
    } else {
      obsah = await ObsahStrankyModel.ziskatVsechny()
    }

    return NextResponse.json({
      uspech: true,
      data: obsah
    })
    
  } catch (error) {
    console.error('Admin chyba při načítání obsahu:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba serveru' },
      { status: 500 }
    )
  }
}

// POST - vytvořit nový obsah
export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validace
    if (!data.klic || !data.hodnota) {
      return NextResponse.json(
        { uspech: false, chyba: 'Povinná pole: klic, hodnota' },
        { status: 400 }
      )
    }

    const novyObsah = await ObsahStrankyModel.vytvorit({
      klic: data.klic,
      hodnota: data.hodnota,
      stranka: data.stranka || 'general'
    })

    return NextResponse.json({
      uspech: true,
      data: novyObsah,
      zprava: 'Obsah byl vytvořen'
    })
    
  } catch (error) {
    console.error('Admin chyba při vytváření obsahu:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při vytváření obsahu' },
      { status: 500 }
    )
  }
}

// PUT - aktualizovat obsah
export async function PUT(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const klic = searchParams.get('klic')
    
    const data = await request.json()
    
    let aktualizovanyObsah
    
    if (id) {
      // Aktualizace podle ID
      aktualizovanyObsah = await ObsahStrankyModel.aktualizovat(parseInt(id), { hodnota: data.hodnota || '' })
    } else if (klic) {
      // Rychlá aktualizace hodnoty podle klíče
      if (data.hodnota) {
        aktualizovanyObsah = await ObsahStrankyModel.aktualizovatHodnotu(klic, data.hodnota)
      } else {
        return NextResponse.json(
          { uspech: false, chyba: 'Chybí hodnota pro aktualizaci' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { uspech: false, chyba: 'Chybí ID nebo klíč pro aktualizaci' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      uspech: true,
      data: aktualizovanyObsah,
      zprava: 'Obsah byl aktualizován'
    })
    
  } catch (error) {
    console.error('Admin chyba při aktualizaci obsahu:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při aktualizaci obsahu' },
      { status: 500 }
    )
  }
}

// DELETE - smazat obsah
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { uspech: false, chyba: 'Chybí ID pro smazání' },
        { status: 400 }
      )
    }

    await ObsahStrankyModel.smazat(parseInt(id))

    return NextResponse.json({
      uspech: true,
      zprava: 'Obsah byl smazán'
    })
    
  } catch (error) {
    console.error('Admin chyba při mazání obsahu:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při mazání obsahu' },
      { status: 500 }
    )
  }
}