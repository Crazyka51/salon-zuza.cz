/**
 * JWT token utilities for authentication
 */

import { SignJWT, jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_EXPIRES_IN = '7d' // 7 days

export interface JWTPayload {
  userId: number
  email: string
  role: string
  permissions: string[]
  [key: string]: any // Allow additional properties for jose compatibility
}

/**
 * Sign a JWT token
 * @param payload Token payload
 * @returns Signed JWT token
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify and decode JWT token
 * @param token JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Extract token from cookies
 * @param cookies Cookie string
 * @returns Token string or null
 */
export function extractTokenFromCookie(cookies: string | null): string | null {
  if (!cookies) return null

  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}
