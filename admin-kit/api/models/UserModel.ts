import { BaseModel } from "./BaseModel"
import type { AdminUser } from "../../core/types"

// Example implementation using the BaseModel
export class UserModel extends BaseModel<AdminUser> {
  constructor() {
    super("users")
  }

  async findMany(params: any): Promise<{ data: AdminUser[]; total: number }> {
    // This is a mock implementation
    // In a real app, you'd use your ORM/database client here
    const mockUsers: AdminUser[] = [
      {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        permissions: ["users.read", "users.create", "users.update", "users.delete"],
      },
      {
        id: "2",
        email: "editor@example.com",
        name: "Editor User",
        role: "editor",
        permissions: ["users.read"],
      },
    ]

    // Apply search filter
    let filteredUsers = mockUsers
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      filteredUsers = mockUsers.filter(
        (user) => user.name?.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm),
      )
    }

    // Apply sorting
    if (params.sortBy) {
      filteredUsers.sort((a, b) => {
        const aValue = a[params.sortBy as keyof AdminUser] || ""
        const bValue = b[params.sortBy as keyof AdminUser] || ""
        const comparison = aValue.toString().localeCompare(bValue.toString())
        return params.sortOrder === "desc" ? -comparison : comparison
      })
    }

    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 10
    const startIndex = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit)

    return {
      data: paginatedUsers,
      total: filteredUsers.length,
    }
  }

  async findById(id: string): Promise<AdminUser | null> {
    // Mock implementation
    const mockUsers: AdminUser[] = [
      {
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        permissions: ["users.read", "users.create", "users.update", "users.delete"],
      },
      {
        id: "2",
        email: "editor@example.com",
        name: "Editor User",
        role: "editor",
        permissions: ["users.read"],
      },
    ]

    return mockUsers.find((user) => user.id === id) || null
  }

  async create(data: Partial<AdminUser>): Promise<AdminUser> {
    // Mock implementation
    const newUser: AdminUser = {
      id: `user_${Date.now()}`,
      email: data.email!,
      name: data.name || "",
      role: data.role || "user",
      permissions: data.permissions || [],
    }

    // In a real implementation, you'd save to database here
    console.log("Creating user:", newUser)

    return newUser
  }

  async update(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    // Mock implementation
    const existingUser = await this.findById(id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    const updatedUser: AdminUser = {
      ...existingUser,
      ...data,
      id, // Ensure ID doesn't change
    }

    // In a real implementation, you'd update in database here
    console.log("Updating user:", updatedUser)

    return updatedUser
  }

  async delete(id: string): Promise<{ id: string; deleted: boolean }> {
    // Mock implementation
    const existingUser = await this.findById(id)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // In a real implementation, you'd delete from database here
    console.log("Deleting user:", id)

    return { id, deleted: true }
  }
}
