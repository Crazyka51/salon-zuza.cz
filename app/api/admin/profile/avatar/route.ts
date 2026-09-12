// API endpoint pro upload profilové fotky
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { verifyJWT, extractTokenFromRequest } from '@/admin-kit/core/auth/jwt'

export const dynamic = 'force-dynamic'

interface AvatarFormData {
  get(name: string): File | string | null
}

export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Není ověřen' },
        { status: 401 }
      )
    }

    const jwtPayload = await verifyJWT(token)
    if (!jwtPayload || !jwtPayload.userId) {
      return NextResponse.json(
        { success: false, error: 'Neplatný token' },
        { status: 401 }
      )
    }

    const formData = await request.formData() as unknown as AvatarFormData
    const file = formData.get('file')

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

    // Validace velikosti (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Soubor je příliš velký. Maximum je 5MB' },
        { status: 400 }
      )
    }

    // Přečtení obsahu souboru
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Generování unikátního názvu souboru
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Nahrání do Vercel Blob
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      contentType: file.type,
    })

    // Aktualizace přihlášeného zaměstnance s avatarem
    const updated = await prisma.zamestnanec.update({
      where: {
        id: parseInt(jwtPayload.userId)
      },
      data: {
        fotoUrl: blob.url
      }
    })

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Uživatel nenalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar: blob.url,
      message: 'Profilová fotka byla úspěšně nahrána'
    })
  } catch (error) {
    console.error('Chyba při uploadu avataru:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při uploadu avataru' },
      { status: 500 }
    )
  }
}
