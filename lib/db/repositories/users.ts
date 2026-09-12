/**
 * Users repository - handles all database operations for admin users
 * Uses Neon template literal syntax for type safety
 */

import { sql } from '../connection'

export interface AdminUser {
  id: number
  email: string
  name: string | null
  password_hash: string
  role: string
  permissions: string[]
  created_at: Date
  updated_at: Date
}

export interface AdminUserSafe extends Omit<AdminUser, 'password_hash'> {}

/**
 * Get all users with optional search and pagination
 */
export async function getUsers(options: {
  search?: string
  limit?: number
  offset?: number
} = {}) {
  const { search, limit = 10, offset = 0 } = options

  if (search) {
    const searchPattern = `%${search}%`
    const users = await sql`
      SELECT id, email, name, role, permissions, created_at, updated_at
      FROM admin_users
      WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM admin_users
      WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
    `
    
    return {
      data: users as AdminUserSafe[],
      total: Number(countResult[0]?.total || 0)
    }
  }

  const users = await sql`
    SELECT id, email, name, role, permissions, created_at, updated_at
    FROM admin_users
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  
  const countResult = await sql`SELECT COUNT(*) as total FROM admin_users`
  
  return {
    data: users as AdminUserSafe[],
    total: Number(countResult[0]?.total || 0)
  }
}

/**
 * Get user by ID (without password)
 */
export async function getUserById(id: number): Promise<AdminUserSafe | null> {
  const result = await sql`
    SELECT id, email, name, role, permissions, created_at, updated_at 
    FROM admin_users 
    WHERE id = ${id}
  `
  return result.length > 0 ? (result[0] as AdminUserSafe) : null
}

/**
 * Get user by email (with password for authentication)
 */
export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const result = await sql`SELECT * FROM admin_users WHERE email = ${email}`
  return result.length > 0 ? (result[0] as AdminUser) : null
}

/**
 * Create new user
 */
export async function createUser(data: {
  email: string
  name: string
  password_hash: string
  role?: string
  permissions?: string[]
}): Promise<AdminUserSafe> {
  const role = data.role || 'user'
  const permissions = JSON.stringify(data.permissions || [])
  
  const result = await sql`
    INSERT INTO admin_users (email, name, password_hash, role, permissions)
    VALUES (${data.email}, ${data.name}, ${data.password_hash}, ${role}, ${permissions})
    RETURNING id, email, name, role, permissions, created_at, updated_at
  `
  return result[0] as AdminUserSafe
}

/**
 * Update user (only provided fields)
 */
export async function updateUser(
  id: number,
  data: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>
): Promise<AdminUserSafe> {
  // Get current user
  const current = await getUserById(id)
  if (!current) {
    throw new Error('User not found')
  }

  // Build updated values
  const email = data.email ?? current.email
  const name = data.name ?? current.name
  const role = data.role ?? current.role
  const permissions = data.permissions 
    ? JSON.stringify(data.permissions) 
    : JSON.stringify(current.permissions)
  
  // Update password only if provided
  if (data.password_hash) {
    const result = await sql`
      UPDATE admin_users SET
        email = ${email},
        name = ${name},
        password_hash = ${data.password_hash},
        role = ${role},
        permissions = ${permissions},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, name, role, permissions, created_at, updated_at
    `
    return result[0] as AdminUserSafe
  } else {
    const result = await sql`
      UPDATE admin_users SET
        email = ${email},
        name = ${name},
        role = ${role},
        permissions = ${permissions},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, name, role, permissions, created_at, updated_at
    `
    return result[0] as AdminUserSafe
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<boolean> {
  await sql`DELETE FROM admin_users WHERE id = ${id}`
  return true
}

/**
 * Check if user has permission
 */
export function hasPermission(user: AdminUser | AdminUserSafe, permission: string): boolean {
  if (user.role === 'admin') return true
  
  const permissions = typeof user.permissions === 'string' 
    ? JSON.parse(user.permissions) 
    : user.permissions
    
  return permissions.includes(permission)
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE role = 'admin') as admins,
      COUNT(*) FILTER (WHERE role = 'user') as users
    FROM admin_users
  `
  
  return {
    total: Number(result[0]?.total || 0),
    admins: Number(result[0]?.admins || 0),
    users: Number(result[0]?.users || 0)
  }
}
