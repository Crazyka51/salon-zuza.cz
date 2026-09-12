import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const obsahy = await prisma.obsahStranky.findMany({
      where: {
        kategorie: 'sluzby',
        jeAktivni: true
      },
      orderBy: {
        poradoveId: 'asc'
      }
    })

    // Přeformátovat data pro snadnější použití na frontendu
    const strukturovanyObsah = {
      hero: {
        nadpis: obsahy.find(o => o.klicObsahu === 'sluzby_hero_nadpis')?.obsah || '',
        podnadpis: obsahy.find(o => o.klicObsahu === 'sluzby_hero_podnadpis')?.obsah || ''
      },
      uvod: obsahy.find(o => o.klicObsahu === 'sluzby_uvod')?.obsah || '',
      sluzby: [
        {
          id: 'strih',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_strih_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_strih_popis')?.obsah || '',
          poradi: 1,
          ikona: 'scissors'
        },
        {
          id: 'barveni',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_barveni_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_barveni_popis')?.obsah || '',
          poradi: 2,
          ikona: 'paint'
        },
        {
          id: 'melir',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_melir_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_melir_popis')?.obsah || '',
          poradi: 3,
          ikona: 'sparkles'
        },
        {
          id: 'svatebni',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_svatebni_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_svatebni_popis')?.obsah || '',
          poradi: 4,
          ikona: 'cake'
        },
        {
          id: 'regenerace',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_regenerace_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_regenerace_popis')?.obsah || '',
          poradi: 5,
          ikona: 'heart'
        },
        {
          id: 'zesvetlen',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_zesvetlen_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_zesvetlen_popis')?.obsah || '',
          poradi: 6,
          ikona: 'sun'
        },
        {
          id: 'plex',
          nazev: obsahy.find(o => o.klicObsahu === 'sluzby_plex_nadpis')?.obsah || '',
          popis: obsahy.find(o => o.klicObsahu === 'sluzby_plex_popis')?.obsah || '',
          poradi: 7,
          ikona: 'badge'
        }
      ],
      cta: {
        nadpis: obsahy.find(o => o.klicObsahu === 'sluzby_cta_nadpis')?.obsah || '',
        popis: obsahy.find(o => o.klicObsahu === 'sluzby_cta_popis')?.obsah || ''
      }
    }

    return NextResponse.json(strukturovanyObsah)
  } catch (error) {
    console.error('Chyba při načítání obsahu služeb:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst obsah služeb' },
      { status: 500 }
    )
  }
}
