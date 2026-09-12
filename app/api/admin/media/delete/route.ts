// API endpoint pro mazání média podle URL
import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'URL souboru není specifikována' },
        { status: 400 }
      )
    }

    const url = decodeURIComponent(path)

    // Smazání z databáze - hledáme v obou tabulkách
    const [galerieItem, fotkaItem] = await Promise.all([
      prisma.galerieObrazek.findFirst({ where: { url } }),
      prisma.fotka.findFirst({ where: { url } }),
    ])

    if (galerieItem) {
      await prisma.galerieObrazek.delete({ where: { id: galerieItem.id } })
    } else if (fotkaItem) {
      await prisma.fotka.delete({ where: { id: fotkaItem.id } })
    }
    // Pokud záznam v DB neexistuje, pokračujeme smazáním z blob storage

    // Smazání z Vercel Blob storage
    try {
      await del(url)
    } catch (blobError) {
      // Logujeme ale neskončíme chybou - soubor možná není v blob storage
      console.warn('Nelze smazat z blob storage (možná lokální soubor):', blobError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Chyba při mazání média:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při mazání média' },
      { status: 500 }
    )
  }
}
