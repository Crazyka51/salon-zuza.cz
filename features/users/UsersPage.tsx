"use client"
import { useState } from "react"
import { TableViewer } from "@/admin-kit/ui/TableViewer"
import { FormGenerator } from "@/admin-kit/ui/FormGenerator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Plus } from "lucide-react"
import type { TableColumn, FormField, AdminUser } from "@/admin-kit/core/types"
import { useAdminApi } from "@/admin-kit/core/hooks/useAdminApi"
import { RoleGuard } from "@/admin-kit/core/auth/RoleGuard"

const userColumns: TableColumn[] = [
  {
    key: "id",
    label: "ID",
    type: "text",
    sortable: true,
  },
  {
    key: "name",
    label: "Name",
    type: "text",
    sortable: true,
    filterable: true,
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    sortable: true,
    filterable: true,
  },
  {
    key: "role",
    label: "Role",
    type: "text",
    sortable: true,
    filterable: true,
    render: (value) => <Badge variant={value === "admin" ? "default" : "secondary"}>{value}</Badge>,
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    sortable: true,
  },
]

const userFormFields: FormField[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter full name",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "user@example.com",
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { value: "admin", label: "Administrator" },
      { value: "editor", label: "Editor" },
      { value: "user", label: "User" },
    ],
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Enter password",
    description: "Minimum 6 characters",
  },
]

export function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const api = useAdminApi()

  const handleCreateUser = async (data: Record<string, any>) => {
    try {
      await api.post("/users", data)
      setIsCreateDialogOpen(false)
      setRefreshKey((prev) => prev + 1) // Trigger table refresh
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  const handleUpdateUser = async (data: Record<string, any>) => {
    if (!selectedUser) return

    try {
      await api.put(`/users/${selectedUser.id}`, data)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      setRefreshKey((prev) => prev + 1) // Trigger table refresh
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

    try {
      await api.delete(`/users/${user.id}`)
      setRefreshKey((prev) => prev + 1) // Trigger table refresh
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const tableActions = [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (user: AdminUser) => {
        setSelectedUser(user)
        setIsViewDialogOpen(true)
      },
      permission: "users.read",
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: (user: AdminUser) => {
        setSelectedUser(user)
        setIsEditDialogOpen(true)
      },
      permission: "users.update",
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: handleDeleteUser,
      permission: "users.delete",
      variant: "destructive" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <RoleGuard permissions={["users.create"]}>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <FormGenerator
                fields={userFormFields}
                onSubmit={handleCreateUser}
                onCancel={() => setIsCreateDialogOpen(false)}
                submitLabel="Create User"
                layout="grid"
                columns={2}
              />
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>

      <TableViewer
        key={refreshKey}
        columns={userColumns}
        apiEndpoint="/users"
        actions={tableActions}
        searchable
        filterable
        pagination
        permissions={{
          read: "users.read",
          create: "users.create",
          update: "users.update",
          delete: "users.delete",
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <FormGenerator
              fields={userFormFields.map((field) =>
                field.name === "password"
                  ? { ...field, required: false, placeholder: "Leave blank to keep current password" }
                  : field,
              )}
              initialData={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedUser(null)
              }}
              submitLabel="Update User"
              layout="grid"
              columns={2}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>{selectedUser.role}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm font-mono">{selectedUser.id}</p>
                </div>
              </div>
              {selectedUser.permissions && selectedUser.permissions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Permissions</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
