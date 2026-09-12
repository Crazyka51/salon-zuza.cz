import { AuthProvider } from "../../../admin-kit/core/auth/AuthProvider"
import LoginPageContent from "./LoginPageContent"

export const metadata = {
  title: "Login - Admin Panel",
  description: "Sign in to the admin panel",
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  )
}
