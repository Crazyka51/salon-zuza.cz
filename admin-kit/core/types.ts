import type React from "react"
// Core TypeScript types for the admin-kit system
export interface AdminConfig {
  title: string
  logo?: string
  theme?: "light" | "dark" | "system"
  navigation: NavigationItem[]
  modules: AdminModule[]
  auth: AuthConfig
  permissions?: PermissionConfig
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  children?: NavigationItem[]
  permission?: string
}

export interface AdminModule {
  id: string
  name: string
  path: string
  component: React.ComponentType<any>
  permissions?: string[]
  api?: {
    list?: string
    create?: string
    read?: string
    update?: string
    delete?: string
  }
}

export interface AuthConfig {
  provider: "nextauth" | "jwt" | "stack-auth" | "custom" | "none"
  loginPath?: string
  redirectAfterLogin?: string
  permissions?: boolean
  jwt?: {
    secret?: string
    expiresIn?: string
  }
}

export interface PermissionConfig {
  roles: Role[]
  permissions: Permission[]
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

export interface Permission {
  id: string
  name: string
  description?: string
}

export interface AdminUser {
  id: string
  email: string
  name?: string
  role?: string
  permissions?: string[]
  jeAdmin?: boolean
  avatar?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminPermission {
  action: string
  resource: string
  condition?: (user: AdminUser, data?: any) => boolean
}

export interface TableColumn {
  key: string
  label: string
  type?: "text" | "number" | "date" | "boolean" | "image" | "custom"
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface FormField {
  name: string
  label: string
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "file"
    | "rich-text"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: any // Zod schema or custom validation
  defaultValue?: any
  description?: string
}

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
