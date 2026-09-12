// API endpoint pro seznam médií - vrací roky, měsíce nebo soubory podle query params
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    // Načteme všechna média z DB sloučením obou tabulek
    const [galerieItems, fotkyItems] = await Promise.all([
      prisma.galerieObrazek.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.fotka.findMany({ orderBy: { createdAt: 'desc' } }),
    ])

    const allMedia = [
      ...galerieItems.map(item => ({
        id: `galerie_${item.id}`,
        name: item.url.split('/').pop() || item.nazev,
        originalName: item.nazev,
        url: item.url,
        size: 0,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      ...fotkyItems.map(item => ({
        id: `fotky_${item.id}`,
        name: item.url.split('/').pop() || item.nazev,
        originalName: item.nazev,
        url: item.url,
        size: 0,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // GET bez parametrů → vrátíme seznam let
    if (!year) {
      const years = [...new Set(
        allMedia.map(m => new Date(m.createdAt).getFullYear().toString())
      )].sort((a, b) => b.localeCompare(a))
      return NextResponse.json({ success: true, years })
    }

    // GET s year, bez month → vrátíme seznam měsíců pro daný rok
    if (year && !month) {
      const months = [...new Set(
        allMedia
          .filter(m => new Date(m.createdAt).getFullYear().toString() === year)
          .map(m => (new Date(m.createdAt).getMonth() + 1).toString().padStart(2, '0'))
      )].sort((a, b) => b.localeCompare(a))
      return NextResponse.json({ success: true, months })
    }

    // GET s year + month → vrátíme soubory
    const media = allMedia.filter(m => {
      const d = new Date(m.createdAt)
      return (
        d.getFullYear().toString() === year &&
        (d.getMonth() + 1).toString().padStart(2, '0') === month
      )
    })

    return NextResponse.json({ success: true, media })

  } catch (error) {
    console.error('Chyba při načítání médií:', error)
    return NextResponse.json({ success: false, error: 'Chyba při načítání médií' }, { status: 500 })
  }
}