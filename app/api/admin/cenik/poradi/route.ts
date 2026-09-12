// API endpoint pro správu pořadí služeb (drag & drop)
import { NextRequest, NextResponse } from 'next/server'
import { Sluzba } from '@prisma/client'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// PUT - aktualizovat pořadí služeb
export async function PUT(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ uspech: false, chyba: 'Nejste přihlášeni' }, { status: 401 })
    }

    const data = await request.json()
    const { sluzbaId, novePoradi, novaKategorieId } = data

    if (!sluzbaId || novePoradi === undefined) {
      return NextResponse.json(
        { uspech: false, chyba: 'Chybí povinné parametry' },
        { status: 400 }
      )
    }

    // Získat původní službu
    const sluzba = await prisma.sluzba.findUnique({
      where: { id: sluzbaId },
      select: {
        id: true,
        kategorieId: true,
        poradi: true
      }
    })

    if (!sluzba) {
      return NextResponse.json(
        { uspech: false, chyba: 'Služba nebyla nalezena' },
        { status: 404 }
      )
    }

    const puvodniKategorieId = sluzba.kategorieId
    const cilovaKategorieId = novaKategorieId || puvodniKategorieId

    // Pokud se přesouvá do jiné kategorie
    if (cilovaKategorieId !== puvodniKategorieId) {
      // Posunout služby v původní kategorii
      await prisma.sluzba.updateMany({
        where: {
          kategorieId: puvodniKategorieId,
          poradi: { gt: sluzba.poradi }
        },
        data: {
          poradi: { decrement: 1 }
        }
      })

      // Posunout služby v nové kategorii
      await prisma.sluzba.updateMany({
        where: {
          kategorieId: cilovaKategorieId,
          poradi: { gte: novePoradi }
        },
        data: {
          poradi: { increment: 1 }
        }
      })

      // Přesunout službu
      await prisma.sluzba.update({
        where: { id: sluzbaId },
        data: {
          kategorieId: cilovaKategorieId,
          poradi: novePoradi
        }
      })
    } else {
      // Přesun v rámci stejné kategorie
      const starePoradi = sluzba.poradi

      if (novePoradi < starePoradi) {
        // Posun nahoru - zvětšit pořadí služeb mezi novým a starým
        await prisma.sluzba.updateMany({
          where: {
            kategorieId: cilovaKategorieId,
            poradi: { gte: novePoradi, lt: starePoradi }
          },
          data: {
            poradi: { increment: 1 }
          }
        })
      } else if (novePoradi > starePoradi) {
        // Posun dolů - snížit pořadí služeb mezi starým a novým
        await prisma.sluzba.updateMany({
          where: {
            kategorieId: cilovaKategorieId,
            poradi: { gt: starePoradi, lte: novePoradi }
          },
          data: {
            poradi: { decrement: 1 }
          }
        })
      }

      // Aktualizovat pořadí přesunuté služby
      await prisma.sluzba.update({
        where: { id: sluzbaId },
        data: { poradi: novePoradi } as any
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
