/**
 * Database connection configuration using Neon Serverless PostgreSQL
 * 
 * This module provides a configured SQL client for querying the database.
 * Uses connection pooling for optimal performance.
 * 
 * @see https://neon.tech/docs/serverless/serverless-driver
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless'

// Configure Neon for better performance
// neonConfig.fetchConnectionCache = true // Deprecated

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not defined. ' +
      'Please add it to your .env.local file.'
    )
  }
  return dbUrl
}

/**
 * SQL client for executing queries against Neon PostgreSQL database
 * Uses template literals for parameterized queries
 * 
 * @example
 * ```typescript
 * import { sql } from '@/lib/db/connection'
 * 
 * // Template literal syntax (prevents SQL injection)
 * const users = await sql`SELECT * FROM admin_users WHERE email = ${email}`
 * 
 * // Get all rows
 * const result = await sql`SELECT COUNT(*) FROM articles`
 * ```
 */
export const sql: NeonQueryFunction<false, false> = neon(getDatabaseUrl())

/**
 * Test database connection
 * Useful for health checks and initialization
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * Execute raw SQL (for migrations and complex queries)
 * For multiple statements, split them and execute separately
 */
export async function executeRawSQL(sqlContent: string): Promise<any> {
  // Split SQL file by statement terminators and execute one by one
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  const results = []
  
  for (const statement of statements) {
    try {
      // Use template literal for each statement
      const result = await sql([statement] as any)
      results.push(result)
    } catch (error: any) {
      // Ignore "already exists" errors for tables/indexes
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }
  }
  
  return results
}
