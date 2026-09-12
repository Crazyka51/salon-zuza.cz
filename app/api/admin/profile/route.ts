// API endpoint pro správu profilu
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT, extractTokenFromRequest } from '@/admin-kit/core/auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({
        id: '1',
        name: 'Admin',
        email: 'admin@salon-zuza.cz',
        phone: '',
        address: '',
        avatar: '/zajac.jpg',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    const jwtPayload = await verifyJWT(token)
    if (!jwtPayload || !jwtPayload.userId) {
      // Return default if token is invalid
      return NextResponse.json({
        id: '1',
        name: 'Admin',
        email: 'admin@salon-zuza.cz',
        phone: '',
        address: '',
        avatar: '/zajac.jpg',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Get user by ID from JWT
    const profile = await prisma.zamestnanec.findUnique({
      where: { id: parseInt(jwtPayload.userId) }
    })

    if (!profile) {
      return NextResponse.json({
        id: '1',
        name: 'Admin',
        email: 'admin@salon-zuza.cz',
        phone: '',
        address: '',
        avatar: '/zajac.jpg',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      id: profile.id.toString(),
      name: `${profile.jmeno} ${profile.prijmeni}`,
      email: profile.email,
      phone: profile.telefon || '',
      address: '',
      avatar: profile.fotoUrl || '/zajac.jpg',
      role: profile.uroven,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Chyba při načítání profilu:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání profilu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { name, email, phone, address } = body

    // Rozdělení jména na jméno a příjmení
    const [jmeno, ...prijmeniParts] = (name || '').split(' ')
    const prijmeni = prijmeniParts.join(' ') || 'Bez příjmení'

    // Aktualizace přihlášeného uživatele
    const updated = await prisma.zamestnanec.update({
      where: { 
        id: parseInt(jwtPayload.userId)
      },
      data: {
        jmeno: jmeno || 'Admin',
        prijmeni: prijmeni || '',
        email: email || 'admin@salon-zuza.cz',
        telefon: phone || null
      }
    })

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Profil nenalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: updated.id.toString(),
      name: `${updated.jmeno} ${updated.prijmeni}`,
      email: updated.email,
      phone: updated.telefon || '',
      address: '',
      avatar: updated.fotoUrl || '/zajac.jpg',
      role: updated.uroven,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Chyba při aktualizaci profilu:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při aktualizaci profilu' },
      { status: 500 }
    )
  }
}
