// API endpoint pro správu pořadí obsahu (drag & drop)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// PUT - aktualizovat pořadí obsahu
export async function PUT(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const data = await request.json()
    const { obsahId, novePoradi, novaKategorie } = data

    if (!obsahId || novePoradi === undefined) {
      return NextResponse.json(
        { uspech: false, chyba: 'Chybí povinné parametry' },
        { status: 400 }
      )
    }

    // Získat původní obsah
    const obsah = await prisma.obsahStranky.findUnique({
      where: { id: obsahId },
      select: {
        id: true,
        kategorie: true,
        poradoveId: true
      }
    })

    if (!obsah) {
      return NextResponse.json(
        { uspech: false, chyba: 'Obsah nebyl nalezen' },
        { status: 404 }
      )
    }

    const puvodniKategorie = obsah.kategorie || 'general'
    const cilovaKategorie = novaKategorie || puvodniKategorie
    const starePoradi = obsah.poradoveId || 0

    // Pokud se přesouvá do jiné kategorie
    if (cilovaKategorie !== puvodniKategorie) {
      // Posunout obsah v původní kategorii
      await prisma.obsahStranky.updateMany({
        where: {
          kategorie: puvodniKategorie,
          poradoveId: { gt: starePoradi }
        },
        data: {
          poradoveId: {
            decrement: 1
          }
        }
      })

      // Posunout obsah v nové kategorii
      await prisma.obsahStranky.updateMany({
        where: {
          kategorie: cilovaKategorie,
          poradoveId: { gte: novePoradi }
        },
        data: {
          poradoveId: {
            increment: 1
          }
        }
      })

      // Přesunout obsah
      await prisma.obsahStranky.update({
        where: { id: obsahId },
        data: {
          kategorie: cilovaKategorie,
          poradoveId: novePoradi
        }
      })
    } else {
      // Přesun v rámci stejné kategorie
      if (novePoradi < starePoradi) {
        // Posun nahoru - zvětšit pořadí obsahu mezi novým a starým
        await prisma.obsahStranky.updateMany({
          where: {
            kategorie: cilovaKategorie,
            poradoveId: { gte: novePoradi, lt: starePoradi }
          },
          data: {
            poradoveId: { increment: 1 }
          }
        })
      } else if (novePoradi > starePoradi) {
        // Posun dolů - snížit pořadí obsahu mezi starým a novým
        await prisma.obsahStranky.updateMany({
          where: {
            kategorie: cilovaKategorie,
            poradoveId: { gt: starePoradi, lte: novePoradi }
          },
          data: {
            poradoveId: { decrement: 1 }
          }
        })
      }

      // Aktualizovat pořadí přesunutého obsahu
      await prisma.obsahStranky.update({
        where: { id: obsahId },
        data: { poradoveId: novePoradi } as any
      })
    }

    return NextResponse.json({
      uspech: true,
      zprava: 'Pořadí bylo aktualizováno'
    })
    
  } catch (error) {
    console.error('Chyba při aktualizaci pořadí:', error)
    return NextResponse.json(
      { uspech: false, chyba: 'Chyba při aktualizaci pořadí' },
      { status: 500 }
    )
  }
}
