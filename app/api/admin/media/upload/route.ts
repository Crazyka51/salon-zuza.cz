// API endpoint pro nahrávání médií
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

interface UploadFormData {
  get(name: string): File | string | null
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.json(
        { success: false, error: 'Požadavek musí být multipart/form-data' },
        { status: 400 }
      )
    }

    const formData = await request.formData() as unknown as UploadFormData
    const file = formData.get('file')
    const kategorieValue = formData.get('kategorie')
    const nazevValue = formData.get('nazev')
    const popisValue = formData.get('popis')
    const altValue = formData.get('alt')
    const kategorie = typeof kategorieValue === 'string' ? kategorieValue || 'galerie' : 'galerie'
    const nazev = typeof nazevValue === 'string' ? nazevValue : ''
    const popis = typeof popisValue === 'string' ? popisValue : ''
    const alt = typeof altValue === 'string' ? altValue : ''

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'Žádný soubor nebyl nahrán' },
        { status: 400 }
      )
    }

    // Validace typu souboru
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Nepodporovaný typ souboru. Povolené: JPEG, PNG, GIF, WEBP' },
        { status: 400 }
      )
    }

    // Validace velikosti (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Soubor je příliš velký. Maximum je 10MB' },
        { status: 400 }
      )
    }

    // Generování unikátního názvu souboru
    const fileExtension = file.name.split('.').pop()
    const fileName = `salon/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Přečtení obsahu souboru
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Nahrání do Vercel Blob
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      contentType: file.type,
    })

    // Uložení do databáze - zkusíme najít nejvhodnější model
    let savedMedia
    
    if (kategorie === 'galerie' || !kategorie) {
      // Použije GalerieObrazek model
      savedMedia = await prisma.galerieObrazek.create({
        data: {
          nazev: nazev || file.name,
          url: blob.url,
          alt: alt || nazev || file.name,
          popis: popis || null,
          kategorie: kategorie || 'general',
          jeViditelna: true,
          poradi: await getNextOrder('galerie')
        }
      })
    } else {
      // Použije Fotka model
      savedMedia = await prisma.fotka.create({
        data: {
          nazev: nazev || file.name,
          url: blob.url,
          popis: popis || null,
          kategorie: kategorie || 'general',
          jeAktivni: true,
          poradoveId: await getNextOrder('fotky')
        }
      })
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      name: fileName,
      originalName: file.name,
      size: file.size,
      id: savedMedia.id
    })

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Chyba při nahrávání média:', msg)
    return NextResponse.json(
      { success: false, error: `Chyba při nahrávání média: ${msg}` },
      { status: 500 }
    )
  }
}

async function getNextOrder(typ: 'galerie' | 'fotky'): Promise<number> {
  try {
    if (typ === 'galerie') {
      const maxOrder = await prisma.galerieObrazek.aggregate({
        _max: { poradi: true }
      })
      return (maxOrder._max.poradi || 0) + 1
    } else {
      const maxOrder = await prisma.fotka.aggregate({
        _max: { poradoveId: true }
      })
      return (maxOrder._max.poradoveId || 0) + 1
    }
  } catch {
    return 1
  }
}