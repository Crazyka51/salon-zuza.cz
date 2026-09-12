"use client"

import type React from "react"
import { useAuth } from "./AuthProvider"

interface RoleGuardProps {
  children: React.ReactNode
  roles?: string[]
  permissions?: string[]
  fallback?: React.ReactNode
  requireAll?: boolean // If true, user must have ALL permissions/roles, if false, ANY
}

export function RoleGuard({ children, roles = [], permissions = [], fallback, requireAll = false }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback || null}</>
  }

  // Check roles
  if (roles.length > 0) {
    const hasRole = requireAll ? roles.every((role) => user.role === role) : roles.some((role) => user.role === role)

    if (!hasRole) {
      return <>{fallback || null}</>
    }
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasPermission = requireAll
      ? permissions.every((permission) => user.permissions?.includes(permission))
      : permissions.some((permission) => user.permissions?.includes(permission))

    if (!hasPermission) {
      return <>{fallback || null}</>
    }
  }

  return <>{children}</>
}

// Utility component for conditional rendering based on permissions
export function CanAccess({
  permission,
  children,
  fallback,
}: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard permissions={[permission]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

// Utility component for conditional rendering based on roles
export function HasRole({
  role,
  children,
  fallback,
}: { role: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard roles={[role]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
