import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16+ proxy - nahrazuje deprecated middleware.ts
 * Maintenance mode detection a routing logic.
 */
export function proxy(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  
  if (maintenanceMode) {
    const pathname = request.nextUrl.pathname

    // Povolit přístup na: maintenance stránku, rezervační systém, admin a API routes
    if (
      pathname === '/maintenance' ||
      pathname.startsWith('/online-rezervace') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/public')
    ) {
      return NextResponse.next()
    }

    // Všechny ostatní požadavky redirectovat na maintenance
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
