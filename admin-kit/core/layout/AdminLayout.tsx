"use client"

import type React from "react"
import { useAdmin } from "../context/AdminProvider"
import { useAuth } from "../auth/AuthProvider"

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const { state, dispatch, hasPermission } = useAdmin()
  const { user, logout } = useAuth()

  return (
    <div className={`min-h-screen bg-background relative ${className}`}>
      {/* Page Content */}
      <main className="flex-1 p-0">{children}</main>
    </div>
  )
}
