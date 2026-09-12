"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./AuthProvider"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallback?: React.ComponentType
  showLogin?: boolean
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  fallback: Fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/admin/login?returnTo=${encodeURIComponent(pathname)}`)
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every((permission) =>
      user.permissions?.includes(permission)
    )

    if (!hasPermissions) {
      if (Fallback) return <Fallback />
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Nedostatečná oprávnění</h1>
            <p className="text-muted-foreground">Nemáte oprávnění pro přístup k této stránce.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
