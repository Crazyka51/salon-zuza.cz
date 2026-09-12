import type { AdminUser, AdminPermission } from "../core/types"

// Permission checking utilities
export class PermissionManager {
  private permissions: AdminPermission[] = []

  constructor(permissions: AdminPermission[] = []) {
    this.permissions = permissions
  }

  addPermission(permission: AdminPermission) {
    this.permissions.push(permission)
  }

  can(user: AdminUser, action: string, resource: string, data?: any): boolean {
    // If no permissions system is configured, allow everything
    if (!user.permissions) return true

    // Check if user has the specific permission
    const permissionKey = `${resource}.${action}`
    if (!user.permissions.includes(permissionKey)) return false

    // Check conditional permissions
    const permission = this.permissions.find((p) => p.action === action && p.resource === resource)

    if (permission?.condition) {
      return permission.condition(user, data)
    }

    return true
  }

  cannot(user: AdminUser, action: string, resource: string, data?: any): boolean {
    return !this.can(user, action, resource, data)
  }
}

// Default permission definitions for Salon Zuza
export const defaultPermissions: AdminPermission[] = [
  { action: "read", resource: "content" },
  { action: "create", resource: "content" },
  { action: "update", resource: "content" },
  { action: "delete", resource: "content" },
  { action: "read", resource: "analytics" },
]

// Permission constants for Salon Zuza admin
export const PERMISSIONS = {
  CONTENT: {
    READ: "content.read",
    CREATE: "content.create",
    UPDATE: "content.update",
    DELETE: "content.delete",
  },
  ANALYTICS: {
    READ: "analytics.read",
  },
} as const
