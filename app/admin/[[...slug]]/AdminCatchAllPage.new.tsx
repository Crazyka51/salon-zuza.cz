"use client"

import { AdminProvider } from "../../../admin-kit/core/context/AdminProvider"
import { AuthProvider } from "../../../admin-kit/core/auth/AuthProvider"
import { AdminRouterProvider } from "../../../admin-kit/core/routing/AdminRouter"
import { AdminLayout } from "../../../admin-kit/core/layout/AdminLayout"
import { AdminDashboardRouter } from "../../../admin-kit/core/routing/AdminDashboardRouter"
import { ErrorBoundary } from "../../../admin-kit/ui/ErrorBoundary"
import { ProtectedRoute } from "../../../admin-kit/core/auth/ProtectedRoute"

interface AdminCatchAllPageProps {
  slug: string[]
}

export function AdminCatchAllPage({ slug }: AdminCatchAllPageProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute>
          <AdminProvider>
            <AdminRouterProvider>
              <AdminLayout>
                <AdminDashboardRouter />
              </AdminLayout>
            </AdminRouterProvider>
          </AdminProvider>
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  )
}
