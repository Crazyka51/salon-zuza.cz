"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../admin-kit/core/auth/AuthProvider"
import { LoginForm } from "../../../admin-kit/core/auth/LoginForm"
import { LoadingSpinner } from "../../../admin-kit/ui/LoadingSpinner"

function LoginPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      const returnTo = new URLSearchParams(window.location.search).get("returnTo")
      router.push(returnTo || "/admin")
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />
  }

  if (user) {
    return <LoadingSpinner fullScreen message="Redirecting..." />
  }

  return (
    <LoginForm
      title="Admin Login"
      description="Sign in to access the admin panel"
      onSuccess={() => {
        const returnTo = new URLSearchParams(window.location.search).get("returnTo")
        router.push(returnTo || "/admin")
      }}
    />
  )
}

export default LoginPageContent
