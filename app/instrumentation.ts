// Next.js Instrumentation Hook - handles middleware-like logic
// This replaces middleware.ts as the recommended approach in Next.js 16+
// For maintenance mode redirection, we use:
// 1. Rewrites in next.config.mjs
// 2. API route handlers for server-side checks
// 3. Server-side redirects in layouts/route handlers

const NODE_ENV = process.env.NODE_ENV
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true'

export async function register() {
  // This runs at startup in server context
  // Logging/monitoring setup can go here
  
  if (MAINTENANCE_MODE && NODE_ENV === 'production') {
    console.log('🔧 [Maintenance Mode] Application is in maintenance mode')
    console.log('📍 [Maintenance Mode] Allowed paths: /maintenance, /online-rezervace, /api')
  } else if (MAINTENANCE_MODE) {
    console.log('🔧 [Dev] Maintenance mode enabled for testing')
  }
  
  console.log('✅ Application instrumentation initialized')
}

// For error handling and monitoring
export const onRequestError = async (
  error: Error,
  request: Request,
) => {
  // Error handling can be added here
  console.error('[Error Handler]', {
    message: error.message,
    path: new URL(request.url).pathname,
    method: request.method,
  })
}
