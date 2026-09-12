import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'
import { verifyJWT, extractTokenFromRequest } from '@/admin-kit/core/auth/jwt'

export const dynamic = 'force-dynamic'

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Není ověřen. Přihlaste se prosím' },
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
    const { currentPassword, newPassword, confirmPassword } = body

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Všechna pole jsou povinná' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Nová hesla se neshodují' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Heslo musí mít alespoň 8 znaků' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'Nové heslo musí být jiné než aktuální heslo' },
        { status: 400 }
      )
    }

    // Get current user by ID from JWT
    const user = await prisma.zamestnanec.findUnique({
      where: { id: parseInt(jwtPayload.userId) }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Uživatel nenalezen' },
        { status: 404 }
      )
    }

    // Verify current password
    let passwordValid = false

    // Check against hashed password if it exists
    if (user.hashedPassword) {
      passwordValid = await comparePassword(currentPassword, user.hashedPassword)
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Aktuální heslo je nesprávné' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.zamestnanec.update({
      where: { id: user.id },
      data: {
        hashedPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Heslo bylo úspěšně změněno'
    })
  } catch (error) {
    console.error('Chyba při změně hesla:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při změně hesla' },
      { status: 500 }
    )
  }
}
