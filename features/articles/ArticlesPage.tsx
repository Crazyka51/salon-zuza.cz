"use client"

import { useState, useEffect } from "react"
import { TableViewer } from "@/admin-kit/ui/TableViewer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText } from "lucide-react"
import type { Article, ArticleStatus } from "./types"
import type { TableColumn } from "@/admin-kit/core/types"

const statusColors: Record<ArticleStatus, string> = {
  draft: "bg-gray-500",
  published: "bg-green-500", 
  archived: "bg-yellow-500",
  scheduled: "bg-blue-500",
}

const statusLabels: Record<ArticleStatus, string> = {
  draft: "Koncept",
  published: "Publikováno",
  archived: "Archivováno", 
  scheduled: "Naplánováno",
}

export function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  })

  const columns: TableColumn[] = [
    {
      key: "title",
      label: "Název",
      type: "text",
      sortable: true,
      render: (value, row: Article) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{value}</div>
            {row.excerpt && (
              <div className="text-sm text-muted-foreground truncate max-w-xs">
                {row.excerpt}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "custom",
      sortable: true,
      filterable: true,
      render: (value: ArticleStatus) => (
        <Badge variant="secondary" className={`${statusColors[value]} text-white`}>
          {statusLabels[value]}
        </Badge>
      ),
    },
    {
      key: "category",
      label: "Kategorie",
      type: "text",
      render: (value, row: Article) => (
        row.category?.name || <span className="text-muted-foreground">Bez kategorie</span>
      ),
    },
    {
      key: "author",
      label: "Autor",
      type: "text",
      render: (value, row: Article) => (
        row.author?.name || <span className="text-muted-foreground">Neznámý</span>
      ),
    },
    {
      key: "viewCount",
      label: "Zobrazení",
      type: "number",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "publishedAt",
      label: "Publikováno",
      type: "date",
      sortable: true,
      render: (value: Date | null) => (
        value ? new Date(value).toLocaleDateString("cs-CZ") : "-"
      ),
    },
    {
      key: "updatedAt",
      label: "Upraveno",
      type: "date",
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleDateString("cs-CZ"),
    },
  ]

  const actions = [
    {
      id: "view",
      label: "Zobrazit",
      icon: Eye,
      onClick: (item: Article) => {
        // Navigate to article view
        window.open(`/article/${item.slug}`, "_blank")
      },
    },
    {
      id: "edit",
      label: "Upravit",
      icon: Edit,
      onClick: (item: Article) => {
        // Navigate to edit form
        window.location.href = `/admin/articles/edit/${item.id}`
      },
    },
    {
      id: "delete",
      label: "Smazat",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: (item: Article) => {
        if (confirm(`Opravdu chcete smazat článek "${item.title}"?`)) {
          // Handle delete
          console.log("Delete article:", item.id)
        }
      },
    },
  ]

  // Load statistics
  useEffect(() => {
    // Mock statistics - replace with real API call
    setStats({
      total: 25,
      published: 18,
      draft: 5,
      archived: 2,
    })
  }, [])

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    console.log(`Bulk ${action} for articles:`, selectedIds)
    
    switch (action) {
      case "publish":
        // Bulk publish
        break
      case "unpublish":
        // Bulk unpublish
        break
      case "archive":
        // Bulk archive
        break
      case "delete":
        if (confirm(`Opravdu chcete smazat ${selectedIds.length} článků?`)) {
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
          <h1 className="text-3xl font-bold">Správa článků</h1>
          <p className="text-muted-foreground">
            Spravujte všechny články vašeho webu
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nový článek
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem článků</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publikováno</CardTitle>
            <Badge className="bg-green-500">
              {stats.published}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koncepty</CardTitle>
            <Badge className="bg-gray-500">
              {stats.draft}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivováno</CardTitle>
            <Badge className="bg-yellow-500">
              {stats.archived}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat články..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtr podle statusu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny statusy</SelectItem>
                <SelectItem value="published">Publikováno</SelectItem>
                <SelectItem value="draft">Koncepty</SelectItem>
                <SelectItem value="archived">Archivováno</SelectItem>
                <SelectItem value="scheduled">Naplánováno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <TableViewer
        columns={columns}
        apiEndpoint="/admin/articles"
        actions={actions}
        selectable={true}
        pageSize={15}
      />
    </div>
  )
}