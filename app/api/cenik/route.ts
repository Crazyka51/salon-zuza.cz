import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const kategorie = await prisma.kategorieSluzeb.findMany({
      where: { jeAktivni: true },
      include: {
        sluzby: {
          where: { jeAktivni: true },
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { poradi: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: kategorie
    })
  } catch (error) {
    console.error('Chyba při načítání ceníku:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání ceníku' },
      { status: 500 }
    )
  }
}
