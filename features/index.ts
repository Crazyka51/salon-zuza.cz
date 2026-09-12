import type React from "react"
import type { AdminModule } from "@/admin-kit/core/types"

// Barrel export for all feature modules
export { UsersPage } from "./users"
export { PostsPage } from "./posts"
export { ArticlesPage } from "./articles"
export { CenikEditor } from "./cenik"
export { EmployeeManager } from "./employees/EmployeeManager"
export { PageContentEditor } from "./content/PageContentEditor"
export { ProfileManager } from "./profile/ProfileManager"
export { ReportIssueDialog } from "./support/ReportIssueDialog"

// Dynamic module component map (nahrazuje admin-kit/modules/moduleComponents)
export const moduleComponents: Record<string, () => Promise<React.ComponentType<any>>> = {
  UsersPage: () => import("./users").then((m) => m.UsersPage),
  PostsPage: () => import("./posts").then((m) => m.PostsPage),
  ArticlesPage: () => import("./articles").then((m) => m.ArticlesPage),
  CenikEditor: () => import("./cenik").then((m) => m.CenikEditor),
  EmployeeManager: () => import("./employees/EmployeeManager").then((m) => m.EmployeeManager),
  PageContentEditor: () => import("./content/PageContentEditor").then((m) => m.PageContentEditor),
  ProfileManager: () => import("./profile/ProfileManager").then((m) => m.ProfileManager),
}

// Default module registry - použijte jako výchozí hodnotu pro AdminDashboardRouter
export const defaultModules: AdminModule[] = []
