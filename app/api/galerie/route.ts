import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Statické záložní obrázky pro případ prázdné DB
const FALLBACK_IMAGES = [
  { id: 'static_1', src: '/imgssalon/interier.jpg',  alt: 'Interiér Salon Zuza',  title: 'Hlavní prostor' },
  { id: 'static_2', src: '/imgssalon/interier2.jpg', alt: 'Interiér salonu',       title: 'Kadeřnické křeslo' },
  { id: 'static_3', src: '/imgssalon/interier3.jpg', alt: 'Interiér salonu',       title: 'Pracovní místo' },
  { id: 'static_4', src: '/imgssalon/interier4.jpg', alt: 'Interiér salonu',       title: 'Styling prostor' },
  { id: 'static_5', src: '/imgssalon/interier5.jpg', alt: 'Interiér salonu',       title: 'Salon z boku' },
  { id: 'static_6', src: '/imgssalon/interier6.jpg', alt: 'Interiér salonu',       title: 'Detaily vybavení' },
]

export async function GET() {
  try {
    const items = await prisma.galerieObrazek.findMany({
      where: { jeViditelna: true },
      orderBy: { poradi: 'asc' },
      select: {
        id: true,
        url: true,
        alt: true,
        nazev: true,
      },
    })

    if (items.length === 0) {
      return NextResponse.json({ source: 'static', images: FALLBACK_IMAGES })
    }

    const images = items.map((item) => ({
      id: String(item.id),
      src: item.url,
      alt: item.alt || item.nazev,
      title: item.nazev,
    }))

    return NextResponse.json({ source: 'db', images })
  } catch (error) {
    console.error('Galerie API error:', error)
    // Fallback na statické obrázky při DB chybě
    return NextResponse.json({ source: 'static', images: FALLBACK_IMAGES })
  }
}
