"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AdminUser } from "../types"
import { useAdminApi } from "../hooks/useAdminApi"

interface AuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  loginEndpoint?: string
  logoutEndpoint?: string
  sessionEndpoint?: string
}

export function AuthProvider({
  children,
  loginEndpoint = "/auth/login",
  logoutEndpoint = "/auth/logout",
  sessionEndpoint = "/auth/session",
}: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useAdminApi()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get(sessionEndpoint)
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.log("No existing session found")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post(loginEndpoint, { email, password })

      if (response.success && response.data) {
        setUser(response.data)
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)

    try {
      await api.post(logoutEndpoint)
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
      // Even if logout fails on server, clear local state
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
