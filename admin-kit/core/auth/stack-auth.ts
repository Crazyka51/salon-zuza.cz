import type { AdminUser } from "../types"

// Stack Auth integration - server-side only
export interface StackAuthConfig {
  projectId: string
  secretKey: string
}

export function getStackAuthConfig(): StackAuthConfig | null {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const secretKey = process.env.STACK_SECRET_SERVER_KEY

  if (!projectId || !secretKey) {
    return null
  }

  return {
    projectId,
    secretKey,
  }
}

export function getStackAuthClientConfig() {
  return {
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "",
  }
}

export async function verifyStackAuthToken(token: string): Promise<AdminUser | null> {
  const config = getStackAuthConfig()
  if (!config) {
    throw new Error("Stack Auth not configured")
  }

  try {
    // Verify token with Stack Auth API
    const response = await fetch(`https://api.stack-auth.com/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-stack-project-id": config.projectId,
        "x-stack-secret-key": config.secretKey,
      },
    })

    if (!response.ok) {
      return null
    }

    const userData = await response.json()

    // Convert Stack Auth user to AdminUser format
    return {
      id: userData.id,
      email: userData.primary_email,
      name: userData.display_name || userData.primary_email,
      role: userData.server_metadata?.role || "user",
      permissions: userData.server_metadata?.permissions || [],
    }
  } catch (error) {
    console.error("Stack Auth verification failed:", error)
    return null
  }
}

export async function createStackAuthUser(email: string, password: string, role = "user"): Promise<AdminUser | null> {
  const config = getStackAuthConfig()
  if (!config) {
    throw new Error("Stack Auth not configured")
  }

  try {
    const response = await fetch(`https://api.stack-auth.com/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-stack-project-id": config.projectId,
        "x-stack-secret-key": config.secretKey,
      },
      body: JSON.stringify({
        primary_email: email,
        password,
        server_metadata: {
          role,
          permissions: getDefaultPermissions(role),
        },
      }),
    })

    if (!response.ok) {
      return null
    }

    const userData = await response.json()

    return {
      id: userData.id,
      email: userData.primary_email,
      name: userData.display_name || userData.primary_email,
      role: userData.server_metadata?.role || "user",
      permissions: userData.server_metadata?.permissions || [],
    }
  } catch (error) {
    console.error("Stack Auth user creation failed:", error)
    return null
  }
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case "admin":
      return ["users.read", "users.create", "users.update", "users.delete", "settings.read", "settings.update"]
    case "editor":
      return ["users.read", "settings.read"]
    default:
      return []
  }
}
