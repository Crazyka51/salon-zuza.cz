// Main entry point for the admin-kit system
export { AdminProvider } from "./core/context/AdminProvider"
export { AdminLayout } from "./core/layout/AdminLayout"
export { getAdminPage } from "./core/routing/getAdminPage"
export { adminApiHandler } from "./api/handler"
export { withAdminAuth } from "./core/auth/withAdminAuth"

// Core components
export { TableViewer } from "./ui/TableViewer"
export { FormGenerator } from "./ui/FormGenerator"
export { Dashboard } from "./ui/Dashboard"

// Types
export type { AdminConfig, AdminModule, AdminUser, AdminPermission } from "./core/types"
