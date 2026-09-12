import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"
import { validateData } from "../../utils/validation"
import type { ApiResponse } from "../../core/types"

// Validation middleware factory
export function createValidationMiddleware(schema: z.ZodSchema) {
  return async (request: NextRequest): Promise<{ success: boolean; data?: any; errors?: Record<string, string> }> => {
    try {
      const body = await request.json()
      return validateData(schema, body)
    } catch (error) {
      return {
        success: false,
        errors: { general: "Invalid JSON data" },
      }
    }
  }
}

// Common validation schemas
export const userValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

export const postValidationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]).optional(),
})

export const settingsValidationSchema = z.object({
  siteName: z.string().min(1, "Site name is required").optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
})

// Rate limiting middleware
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []

    // Filter out old requests
    const recentRequests = requests.filter((timestamp) => timestamp > windowStart)

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const requests = this.requests.get(identifier) || []
    const recentRequests = requests.filter((timestamp) => timestamp > windowStart)

    return Math.max(0, this.maxRequests - recentRequests.length)
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(60000, 100) // 100 requests per minute

// Rate limiting middleware
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous"

  if (!globalRateLimiter.isAllowed(identifier)) {
    return NextResponse.json(
      {
        success: false,
        message: "Rate limit exceeded",
      } as ApiResponse,
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": globalRateLimiter.getRemainingRequests(identifier).toString(),
          "Retry-After": "60",
        },
      },
    )
  }

  return null
}
