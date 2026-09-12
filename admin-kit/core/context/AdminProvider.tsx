"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { AdminConfig, AdminUser } from "../types"
import { mergeAdminConfig } from "../config"

interface AdminState {
  config: AdminConfig
  user: AdminUser | null
  loading: boolean
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"
}

type AdminAction =
  | { type: "SET_USER"; payload: AdminUser | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }
  | { type: "SET_CONFIG"; payload: AdminConfig }

const AdminContext = createContext<{
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  hasPermission: (permission: string) => boolean
} | null>(null)

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case "SET_THEME":
      return { ...state, theme: action.payload }
    case "SET_CONFIG":
      return { ...state, config: action.payload }
    default:
      return state
  }
}

interface AdminProviderProps {
  children: React.ReactNode
  config?: Partial<AdminConfig>
}

export function AdminProvider({ children, config = {} }: AdminProviderProps) {
  const mergedConfig = mergeAdminConfig(config)

  const [state, dispatch] = useReducer(adminReducer, {
    config: mergedConfig,
    user: null,
    loading: true,
    sidebarOpen: true,
    theme: mergedConfig.theme || "system",
  })

  const hasPermission = (permission: string): boolean => {
    if (!state.user || !state.config.auth.permissions) return true
    return state.user.permissions?.includes(permission) || false
  }

  // Initialize user session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // This would integrate with your auth system
        const response = await fetch("/api/admin/auth/session")
        if (response.ok) {
          const user = await response.json()
          dispatch({ type: "SET_USER", payload: user })
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initializeAuth()
  }, [])

  return <AdminContext.Provider value={{ state, dispatch, hasPermission }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}
