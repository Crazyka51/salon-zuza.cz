import { type NextRequest, NextResponse } from "next/server"
import type { AdminUser } from "../core/types"
import { validateData, loginSchema } from "../utils/validation"
import { signJWT, verifyJWT, extractTokenFromRequest } from "../core/auth/jwt"
import { verifyStackAuthToken, getStackAuthConfig } from "../core/auth/stack-auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"

// Password hashing utility functions
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function handleLogin(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: validation.errors,
        },
        { status: 400 },
      )
    }

    if (!validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
        },
        { status: 400 },
      )
    }

    const { email, password } = validation.data

    // Find user in database
    const zamestnanec = await prisma.zamestnanec.findUnique({
      where: { email },
    })

    if (!zamestnanec) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Check if user is active
    if (!zamestnanec.jeAktivni) {
      return NextResponse.json(
        {
          success: false,
          message: "User account is inactive",
        },
        { status: 401 },
      )
    }

    // Get password from database or check against default
    // Note: In production, passwords should be stored in database
    // For now, check against environment variable fallback
    let passwordValid = false
    
    // Check if password matches default test passwords
    // Check hashed password first
    if (zamestnanec.hashedPassword) {
      passwordValid = await comparePassword(password, zamestnanec.hashedPassword)
    }

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Create user object for JWT
    const user: AdminUser = {
      id: zamestnanec.id.toString(),
      email: zamestnanec.email,
      name: `${zamestnanec.jmeno} ${zamestnanec.prijmeni}`,
      role: (zamestnanec.uroven as any) || "editor",
      jeAdmin: zamestnanec.jeAdmin,
      permissions: zamestnanec.jeAdmin
        ? ["users.read", "users.create", "users.update", "users.delete", "settings.read", "settings.update"]
        : ["users.read", "settings.read"],
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role || "editor",
      permissions: user.permissions || [],
    })

    const response = NextResponse.json({
      success: true,
      data: user,
      token,
      message: "Login successful",
    })

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function handleLogout(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    message: "Logout successful",
  })

  response.cookies.delete("admin-token")

  return response
}

export async function handleSession(request: NextRequest): Promise<NextResponse> {
  const stackAuthConfig = getStackAuthConfig()
  if (stackAuthConfig) {
    const token = extractTokenFromRequest(request)
    if (token) {
      const user = await verifyStackAuthToken(token)
      if (user) {
        return NextResponse.json({
          success: true,
          data: user,
        })
      }
    }
  }

  const token = request.cookies.get("admin-token")?.value

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "No session found",
      },
      { status: 401 },
    )
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid session",
      },
      { status: 401 },
    )
  }

  // Find user by ID from JWT payload
  const zamestnanec = await prisma.zamestnanec.findUnique({
    where: { id: parseInt(payload.userId, 10) },
  })

  if (!zamestnanec) {
    return NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 401 },
    )
  }

  // Build user object
  const user: AdminUser = {
    id: zamestnanec.id.toString(),
    email: zamestnanec.email,
    name: `${zamestnanec.jmeno} ${zamestnanec.prijmeni}`,
    role: (zamestnanec.uroven as any) || "editor",
    jeAdmin: zamestnanec.jeAdmin,
    permissions: zamestnanec.jeAdmin
      ? ["users.read", "users.create", "users.update", "users.delete", "settings.read", "settings.update"]
      : ["users.read", "settings.read"],
  }

  return NextResponse.json({
    success: true,
    data: user,
  })
}
