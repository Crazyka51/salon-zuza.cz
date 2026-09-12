"use client"
import { useState } from "react"
import { TableViewer } from "@/admin-kit/ui/TableViewer"
import { FormGenerator } from "@/admin-kit/ui/FormGenerator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Plus } from "lucide-react"
import type { TableColumn, FormField } from "@/admin-kit/core/types"
import { useAdminApi } from "@/admin-kit/core/hooks/useAdminApi"
import { RoleGuard } from "@/admin-kit/core/auth/RoleGuard"

interface Post {
  id: string
  title: string
  content: string
  status: "draft" | "published" | "archived"
  authorId: string
  createdAt: string
  updatedAt?: string
}

const postColumns: TableColumn[] = [
  {
    key: "id",
    label: "ID",
    type: "text",
    sortable: true,
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    sortable: true,
    filterable: true,
  },
  {
    key: "status",
    label: "Status",
    type: "text",
    sortable: true,
    filterable: true,
    render: (value) => {
      const variants = {
        draft: "secondary",
        published: "default",
        archived: "outline",
      } as const
      return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
    },
  },
  {
    key: "authorId",
    label: "Author",
    type: "text",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    sortable: true,
  },
]

const postFormFields: FormField[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Enter post title",
  },
  {
    name: "content",
    label: "Content",
    type: "rich-text",
    required: true,
    placeholder: "Write your post content here...",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    defaultValue: "draft",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
  },
]

export function PostsPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const api = useAdminApi()

  const handleCreatePost = async (data: Record<string, any>) => {
    try {
      await api.post("/posts", data)
      setIsCreateDialogOpen(false)
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleUpdatePost = async (data: Record<string, any>) => {
    if (!selectedPost) return

    try {
      await api.put(`/posts/${selectedPost.id}`, data)
      setIsEditDialogOpen(false)
      setSelectedPost(null)
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return

    try {
      await api.delete(`/posts/${post.id}`)
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const tableActions = [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (post: Post) => {
        setSelectedPost(post)
        setIsViewDialogOpen(true)
      },
      permission: "posts.read",
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: (post: Post) => {
        setSelectedPost(post)
        setIsEditDialogOpen(true)
      },
      permission: "posts.update",
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: handleDeletePost,
      permission: "posts.delete",
      variant: "destructive" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Manage blog posts and articles</p>
        </div>
        <RoleGuard permissions={["posts.create"]}>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <FormGenerator
                fields={postFormFields}
                onSubmit={handleCreatePost}
                onCancel={() => setIsCreateDialogOpen(false)}
                submitLabel="Create Post"
                layout="vertical"
              />
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>

      <TableViewer
        key={refreshKey}
        columns={postColumns}
        apiEndpoint="/posts"
        actions={tableActions}
        searchable
        filterable
        pagination
        permissions={{
          read: "posts.read",
          create: "posts.create",
          update: "posts.update",
          delete: "posts.delete",
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <FormGenerator
              fields={postFormFields}
              initialData={selectedPost}
              onSubmit={handleUpdatePost}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedPost(null)
              }}
              submitLabel="Update Post"
              layout="vertical"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-lg font-semibold">{selectedPost.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedPost.status === "published"
                          ? "default"
                          : selectedPost.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {selectedPost.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Author ID</label>
                  <p className="text-sm font-mono">{selectedPost.authorId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Content</label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
