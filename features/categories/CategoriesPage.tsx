/* eslint-disable @next/next/no-inline-styles */
"use client"

import { useState, useEffect } from "react"
import styles from "./CategoriesPage.module.css"
import { CategoryColorDot } from "./CategoryColorDot"
import { TableViewer } from "@/admin-kit/ui/TableViewer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Folder, 
  Edit, 
  Trash2, 
  FileText,
  FolderOpen,
  Palette,
  Image as ImageIcon
} from "lucide-react"
import type { Category } from "../articles/types"
import type { TableColumn } from "@/admin-kit/core/types"

const colorOptions = [
  { value: "#3b82f6", label: "Modrá", color: "bg-blue-500" },
  { value: "#10b981", label: "Zelená", color: "bg-green-500" },
  { value: "#f59e0b", label: "Oranžová", color: "bg-yellow-500" },
  { value: "#8b5cf6", label: "Fialová", color: "bg-purple-500" },
  { value: "#ef4444", label: "Červená", color: "bg-red-500" },
  { value: "#6b7280", label: "Šedá", color: "bg-gray-500" },
]

export function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    color: "#6b7280",
    image: "",
  })
  const [stats, setStats] = useState({
    total: 0,
    topLevel: 0,
    withSubcategories: 0,
  })

  const columns: TableColumn[] = [
    {
      key: "name",
      label: "Kategorie",
      type: "text",
      sortable: true,
      render: (value, row: Category) => (
        <div className="flex items-center space-x-3">
          <CategoryColorDot color={row.color || '#808080'} />
          <div className="flex items-center space-x-2">
            {row.parentId ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-blue-600" />
            )}
            <div>
              <div className="font-medium">{value}</div>
              {row.description && (
                <div className="text-sm text-muted-foreground truncate max-w-xs">
                  {row.description}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      label: "URL slug",
      type: "text",
      render: (value: string) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: "parent",
      label: "Nadkategorie",
      type: "text",
      render: (value, row: Category) => (
        row.parent?.name || <span className="text-muted-foreground">Hlavní kategorie</span>
      ),
    },
    {
      key: "articleCount",
      label: "Počet článků",
      type: "number",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Vytvořeno",
      type: "date",
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleDateString("cs-CZ"),
    },
  ]

  const actions = [
    {
      id: "edit",
      label: "Upravit",
      icon: Edit,
      onClick: (item: Category) => {
        setEditingCategory(item)
        setFormData({
          name: item.name,
          description: item.description || "",
          parentId: item.parentId || "",
          color: item.color || "#6b7280",
          image: item.image || "",
        })
        setIsCreateDialogOpen(true)
      },
    },
    {
      id: "delete",
      label: "Smazat",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: (item: Category) => {
        if (confirm(`Opravdu chcete smazat kategorii "${item.name}"?`)) {
          console.log("Delete category:", item.id)
        }
      },
    },
  ]

  // Load statistics
  useEffect(() => {
    setStats({
      total: 12,
      topLevel: 5,
      withSubcategories: 2,
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Chyba při ukládání kategorie")

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        parentId: "",
        color: "#6b7280",
        image: "",
      })
      setEditingCategory(null)
      setIsCreateDialogOpen(false)
      
      // Refresh table data here
      
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    console.log(`Bulk ${action} for categories:`, selectedIds)
    
    switch (action) {
      case "delete":
        if (confirm(`Opravdu chcete smazat ${selectedIds.length} kategorií?`)) {
          // Bulk delete
        }
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Správa kategorií</h1>
          <p className="text-muted-foreground">
            Organizujte obsah pomocí kategorií a podkategorií
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null)
              setFormData({
                name: "",
                description: "",
                parentId: "",
                color: "#6b7280",
                image: "",
              })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nová kategorie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Upravit kategorii" : "Nová kategorie"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Název kategorie *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Název kategorie..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Popis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Popis kategorie..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="parentId">Nadkategorie</Label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte nadkategorii (volitelné)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Hlavní kategorie</SelectItem>
                    <SelectItem value="1">Technologie</SelectItem>
                    <SelectItem value="2">Marketing</SelectItem>
                    <SelectItem value="3">Design</SelectItem>
                    <SelectItem value="5">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Barva</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.color === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData({ ...formData, color: option.value })}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${option.color}`} />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="image">Obrázek kategorie</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL obrázku..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Zrušit
                </Button>
                <Button type="submit">
                  {editingCategory ? "Aktualizovat" : "Vytvořit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem kategorií</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hlavní kategorie</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.topLevel}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">S podkategoriemi</CardTitle>
            <Badge className="bg-purple-500">
              {stats.withSubcategories}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.withSubcategories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hledat kategorie..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <TableViewer
        columns={columns}
        apiEndpoint="/admin/categories"
        actions={actions}
        selectable={true}
        pageSize={15}
      />
    </div>
  )
}