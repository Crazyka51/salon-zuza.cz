import { NextRequest, NextResponse } from 'next/server'

/**
 * Internal API for maintenance mode checking
 * This route helps enforce maintenance mode across the application
 * Usage: Call this from layouts/pages to check if maintenance redirect is needed
 */
export async function GET(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  const pathname = request.nextUrl.pathname
  
  // Paths that are always allowed
  const allowedPaths = [
    '/maintenance',
    '/online-rezervace',
    '/api',
    '/_next',
  ]

  const isAllowed = allowedPaths.some(path => pathname.startsWith(path))

  return NextResponse.json({
    maintenanceMode,
    pathname,
    isAllowed,
    shouldRedirect: maintenanceMode && !isAllowed,
  }, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  })
}
