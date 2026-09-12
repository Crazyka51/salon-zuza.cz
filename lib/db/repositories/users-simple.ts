/**
 * Users repository - handles all database operations for admin users
 * Uses Neon template literal syntax
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
 * Get all users with optional search
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
      data: users,
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
    data: users,
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
 * Update user
 */
export async function updateUser(
  id: number,
  data: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>
): Promise<AdminUserSafe> {
  // Build update fields dynamically
  const updates: string[] = []
  const values: any[] = []
  
  if (data.email !== undefined) {
    updates.push('email = $' + (values.length + 1))
    values.push(data.email)
  }
  if (data.name !== undefined) {
    updates.push('name = $' + (values.length + 1))
    values.push(data.name)
  }
  if (data.password_hash !== undefined) {
    updates.push('password_hash = $' + (values.length + 1))
    values.push(data.password_hash)
  }
  if (data.role !== undefined) {
    updates.push('role = $' + (values.length + 1))
    values.push(data.role)
  }
  if (data.permissions !== undefined) {
    updates.push('permissions = $' + (values.length + 1))
    values.push(JSON.stringify(data.permissions))
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update')
  }
  
  updates.push('updated_at = NOW()')
  
  const query = `
    UPDATE admin_users SET ${updates.join(', ')}
    WHERE id = $${values.length + 1}
    RETURNING id, email, name, role, permissions, created_at, updated_at
  `
  values.push(id)
  
  const result = await (sql as any)(query, ...values)
  return result[0] as AdminUserSafe
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM admin_users WHERE id = ${id}`
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
