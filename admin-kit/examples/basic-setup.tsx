// Example of how to integrate admin-kit into a Next.js application

import { AdminProvider } from "../core/context/AdminProvider"
import { AuthProvider } from "../core/auth/AuthProvider"
import { AdminLayout } from "../core/layout/AdminLayout"
import { Dashboard } from "../ui/Dashboard"
import type { AdminConfig } from "../core/types"

// Basic configuration example
const basicConfig: Partial<AdminConfig> = {
  title: "My Admin Panel",
  theme: "system",
  navigation: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      icon: "Home",
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users",
      icon: "Users",
      permission: "users.read",
    },
  ],
  auth: {
    provider: "custom",
    loginPath: "/admin/login",
    permissions: true,
  },
}

// Basic usage example
export function BasicAdminApp() {
  return (
    <AuthProvider>
      <AdminProvider config={basicConfig}>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </AdminProvider>
    </AuthProvider>
  )
}
