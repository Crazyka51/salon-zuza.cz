"use client"

import type React from "react"
import { AdminLayout } from "./AdminLayout"

interface UnifiedAdminLayoutProps {
  children: React.ReactNode
}

// Deprecated: Use AdminLayout instead  
export function UnifiedAdminLayout({ children }: UnifiedAdminLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}
