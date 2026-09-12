import { type NextRequest, NextResponse } from "next/server"
import { authenticateApiRequest, requirePermission } from "../core/auth/proxy"
import { handleLogin, handleLogout, handleSession } from "./auth"
import { createCrudHandlers } from "./crud"

// Main API handler for catch-all admin routes
export async function adminApiHandler(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split("/").filter(Boolean)

  // Remove 'api' and 'admin' from path segments
  const adminPath = pathSegments.slice(2) // Assumes /api/admin/...

  try {
    // Handle authentication routes
    if (adminPath[0] === "auth") {
      return handleAuthRoutes(request, adminPath.slice(1))
    }

    // Authenticate user for all other routes
    const user = await authenticateApiRequest(request)
    if (!user) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Authentication required",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    // Handle different API routes
    switch (adminPath[0]) {
      case "users":
        return handleUsersApi(request, adminPath.slice(1), user)
      case "posts":
        return handlePostsApi(request, adminPath.slice(1), user)
      case "settings":
        return handleSettingsApi(request, adminPath.slice(1), user)
      case "profile":
        return handleProfileApi(request, adminPath.slice(1), user)
      default:
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "API endpoint not found",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        )
    }
  } catch (error) {
    console.error("Admin API error:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// Authentication routes handler
async function handleAuthRoutes(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const [action] = pathSegments

  switch (action) {
    case "login":
      if (request.method === "POST") {
        return handleLogin(request)
      }
      break
    case "logout":
      if (request.method === "POST") {
        return handleLogout(request)
      }
      break
    case "session":
      if (request.method === "GET") {
        return handleSession(request)
      }
      break
  }

  return new NextResponse(
    JSON.stringify({
      success: false,
      message: "Method not allowed",
    }),
    { status: 405, headers: { "Content-Type": "application/json" } },
  )
}

// Users API handler
async function handleUsersApi(request: NextRequest, pathSegments: string[], user: any): Promise<NextResponse> {
  const crudHandlers = createCrudHandlers("users", {
    permissions: {
      read: "users.read",
      create: "users.create",
      update: "users.update",
      delete: "users.delete",
    },
    model: {
      // This would be your actual data model/ORM integration
      async findMany(params: any) {
        // Mock data - replace with actual database query
        return {
          data: [
            { id: "1", name: "John Doe", email: "john@example.com", role: "admin", createdAt: new Date() },
            { id: "2", name: "Jane Smith", email: "jane@example.com", role: "editor", createdAt: new Date() },
          ],
          total: 2,
        }
      },
      async findById(id: string) {
        return { id, name: "John Doe", email: "john@example.com", role: "admin", createdAt: new Date() }
      },
      async create(data: any) {
        return { id: "new", ...data, createdAt: new Date() }
      },
      async update(id: string, data: any) {
        return { id, ...data, updatedAt: new Date() }
      },
      async delete(id: string) {
        return { id, deleted: true }
      },
    },
  })

  return crudHandlers(request, pathSegments, user)
}

// Posts API handler
async function handlePostsApi(request: NextRequest, pathSegments: string[], user: any): Promise<NextResponse> {
  const crudHandlers = createCrudHandlers("posts", {
    permissions: {
      read: "posts.read",
      create: "posts.create",
      update: "posts.update",
      delete: "posts.delete",
    },
    model: {
      async findMany(params: any) {
        return {
          data: [
            {
              id: "1",
              title: "Getting Started with Next.js",
              content: "This is a sample post...",
              status: "published",
              authorId: user.id,
              createdAt: new Date(),
            },
          ],
          total: 1,
        }
      },
      async findById(id: string) {
        return {
          id,
          title: "Getting Started with Next.js",
          content: "This is a sample post...",
          status: "published",
          authorId: user.id,
          createdAt: new Date(),
        }
      },
      async create(data: any) {
        return { id: "new", ...data, authorId: user.id, createdAt: new Date() }
      },
      async update(id: string, data: any) {
        return { id, ...data, updatedAt: new Date() }
      },
      async delete(id: string) {
        return { id, deleted: true }
      },
    },
  })

  return crudHandlers(request, pathSegments, user)
}

// Settings API handler
async function handleSettingsApi(request: NextRequest, pathSegments: string[], user: any): Promise<NextResponse> {
  if (!requirePermission(user, "settings.read")) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Insufficient permissions",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    )
  }

  const [action] = pathSegments

  switch (request.method) {
    case "GET":
      if (!action) {
        // Get all settings
        return new NextResponse(
          JSON.stringify({
            success: true,
            data: {
              siteName: "My Admin Panel",
              theme: "light",
              emailNotifications: true,
              maintenanceMode: false,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      } else {
        // Get specific setting
        return new NextResponse(
          JSON.stringify({
            success: true,
            data: { key: action, value: "sample-value" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }

    case "PUT":
      if (!requirePermission(user, "settings.update")) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Insufficient permissions",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        )
      }

      const body = await request.json()
      // Update settings logic here
      return new NextResponse(
        JSON.stringify({
          success: true,
          data: body,
          message: "Settings updated successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )

    default:
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Method not allowed",
        }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      )
  }
}

// Profile API handler
async function handleProfileApi(request: NextRequest, pathSegments: string[], user: any): Promise<NextResponse> {
  const [action] = pathSegments

  switch (request.method) {
    case "GET":
      if (!action) {
        // Get current user profile
        return new NextResponse(
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            address: user.address || "",
            avatar: user.avatar || "",
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }
      break

    case "PUT":
      if (!action) {
        // Update user profile
        try {
          const body = await request.json()

          // Validate required fields
          if (!body.name || !body.email) {
            return new NextResponse(
              JSON.stringify({
                success: false,
                message: "Name and email are required",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            )
          }

          // Here you would update the user in your database
          // For now, we'll just return success
          const updatedUser = {
            id: user.id,
            name: body.name,
            email: body.email,
            phone: body.phone || "",
            address: body.address || "",
            avatar: body.avatar || user.avatar,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: new Date().toISOString(),
          }

          return new NextResponse(
            JSON.stringify({
              success: true,
              data: updatedUser,
              message: "Profile updated successfully",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          )
        } catch (error) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              message: "Invalid JSON data",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          )
        }
      }
      break

    default:
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Method not allowed",
        }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      )
  }

  return new NextResponse(
    JSON.stringify({
      success: false,
      message: "Endpoint not found",
    }),
    { status: 404, headers: { "Content-Type": "application/json" } },
  )
}
