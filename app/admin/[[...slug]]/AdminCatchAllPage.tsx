"use client"

import { AdminProvider } from "../../../admin-kit/core/context/AdminProvider"
import { AuthProvider } from "../../../admin-kit/core/auth/AuthProvider"
import { AdminRouterProvider } from "../../../admin-kit/core/routing/AdminRouter"
import { AdminLayout } from "../../../admin-kit/core/layout/AdminLayout"
import { AdminDashboardRouter } from "../../../admin-kit/core/routing/AdminDashboardRouter"
import { ErrorBoundary } from "../../../admin-kit/ui/ErrorBoundary"
import { ProtectedRoute } from "../../../admin-kit/core/auth/ProtectedRoute"
import { Toaster } from "../../../components/ui/toaster"
import type { AdminConfig } from "../../../admin-kit/core/types"

// Admin configuration - Salon Zuza
const adminConfig: Partial<AdminConfig> = {
  title: "",
  theme: "dark",
  navigation: [
    {
      id: "dashboard",
      label: "Přehled",
      href: "/admin",
      icon: "Home",
    },
    {
      id: "analytics",
      label: "Statistiky",
      href: "/admin/statistiky",
      icon: "BarChart3",
    },
  ],
  auth: {
    provider: "custom",
    loginPath: "/admin/login",
    redirectAfterLogin: "/admin",
    permissions: true,
  },
}

interface AdminCatchAllPageProps {
  slug: string[]
}

export function AdminCatchAllPage({ slug }: AdminCatchAllPageProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminProvider config={adminConfig}>
          <AdminRouterProvider>
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboardRouter slug={slug} />
              </AdminLayout>
              <Toaster />
            </ProtectedRoute>
          </AdminRouterProvider>
        </AdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
