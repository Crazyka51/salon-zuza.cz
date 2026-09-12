import type { AdminConfig } from "./types"

// Default configuration for the Salon Zuza admin system
export const defaultAdminConfig: AdminConfig = {
  title: "Salon Zuza - Administrace",
  theme: "system",
  navigation: [
    {
      id: "dashboard",
      label: "Přehled",
      href: "/admin",
      icon: "Home",
    },
    {
      id: "content",
      label: "Editor obsahu",
      href: "/admin/editor-obsahu",
      icon: "FileText",
    },
    {
      id: "analytics",
      label: "Statistiky",
      href: "/admin/statistiky",
      icon: "BarChart3",
    },
  ],
  modules: [],
  auth: {
    provider: "jwt",
    loginPath: "/admin/login",
    redirectAfterLogin: "/admin",
    permissions: true,
    jwt: {
      secret: process.env.JWT_SECRET ?? "",
      expiresIn: "7d",
    },
  },
}

// Configuration merger utility
export function mergeAdminConfig(userConfig: Partial<AdminConfig>): AdminConfig {
  return {
    ...defaultAdminConfig,
    ...userConfig,
    navigation: userConfig.navigation || defaultAdminConfig.navigation,
    modules: userConfig.modules || defaultAdminConfig.modules,
    auth: {
      ...defaultAdminConfig.auth,
      ...userConfig.auth,
      jwt: {
        ...defaultAdminConfig.auth.jwt,
        ...userConfig.auth?.jwt,
      },
    },
  }
}
