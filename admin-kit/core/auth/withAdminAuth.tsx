"use client"

import type React from "react"
import { useAdmin } from "../context/AdminProvider"

interface WithAdminAuthOptions {
  requiredPermissions?: string[]
  fallback?: React.ComponentType
  redirectTo?: string
}

export function withAdminAuth<P extends object>(Component: React.ComponentType<P>, options: WithAdminAuthOptions = {}) {
  const { requiredPermissions = [], fallback: Fallback, redirectTo } = options

  return function AuthenticatedComponent(props: P) {
    const { state, hasPermission } = useAdmin()
    const { user, loading } = state

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!user) {
      if (redirectTo) {
        window.location.href = redirectTo
        return null
      }

      if (Fallback) {
        return <Fallback />
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You need to be logged in to access this page.</p>
          </div>
        </div>
      )
    }

    // Check permissions
    const hasRequiredPermissions = requiredPermissions.every((permission) => hasPermission(permission))

    if (!hasRequiredPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Insufficient Permissions</h1>
            <p className="text-muted-foreground">You don't have the required permissions to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// Hook for checking permissions in components
export function useAdminAuth() {
  const { state, hasPermission } = useAdmin()

  return {
    user: state.user,
    loading: state.loading,
    isAuthenticated: !!state.user,
    hasPermission,
    checkPermissions: (permissions: string[]) => permissions.every((permission) => hasPermission(permission)),
  }
}
