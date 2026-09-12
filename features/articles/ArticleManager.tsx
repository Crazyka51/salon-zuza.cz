"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  FileText,
  Calendar,
  Tag as TagIcon,
  Filter
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Article {
  id: string
  title: string
  excerpt?: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  category?: string
  author?: string
  createdAt: string
  updatedAt: string
}

interface ArticleManagerProps {
  onEditArticle?: (article: Article) => void
  onCreateNew?: () => void
}

export default function ArticleManager({ onEditArticle, onCreateNew }: ArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Simulace dat
  useEffect(() => {
    const mockArticles: Article[] = [
      {
        id: "1",
        title: "Začínáme s Next.js 14",
        excerpt: "Průvodce pro začátečníky",
        status: "PUBLISHED",
        category: "Tutoriály",
        author: "Admin",
        createdAt: "2026-01-20",
        updatedAt: "2026-01-25"
      },
      {
        id: "2",
        title: "React Server Components",
        excerpt: "Nová éra React aplikací",
        status: "DRAFT",
        category: "React",
        author: "Admin",
        createdAt: "2026-01-15",
        updatedAt: "2026-01-28"
      },
      {
        id: "3",
        title: "TypeScript Best Practices",
        excerpt: "Tipy a triky pro lepší kód",
        status: "PUBLISHED",
        category: "TypeScript",
        author: "Admin",
        createdAt: "2026-01-10",
        updatedAt: "2026-01-24"
      }
    ]
    
    setTimeout(() => {
      setArticles(mockArticles)
      setIsLoading(false)
    }, 500)
  }, [])

  const getStatusBadge = (status: Article["status"]) => {
    const statusConfig = {
      PUBLISHED: { label: "Publikováno", className: "bg-emerald-500 text-white dark:bg-emerald-600" },
      DRAFT: { label: "Koncept", className: "bg-yellow-500 text-white dark:bg-yellow-600" },
      ARCHIVED: { label: "Archivováno", className: "bg-red-500 text-white dark:bg-red-600" }
    }
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || article.status === selectedStatus
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            Správa článků
          </h1>
          <p className="text-muted-foreground">Spravujte publikované články a koncepty</p>
        </div>
        <Button onClick={() => onCreateNew ? onCreateNew() : window.location.href = '/admin/articles/new'} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Nový článek
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Celkem článků</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publikované</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {articles.filter(a => a.status === "PUBLISHED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Koncepty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {articles.filter(a => a.status === "DRAFT").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat články..."
                className="pl-9 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Všechny statusy</SelectItem>
                <SelectItem value="PUBLISHED">Publikované</SelectItem>
                <SelectItem value="DRAFT">Koncepty</SelectItem>
                <SelectItem value="ARCHIVED">Archivované</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <TagIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Všechny kategorie</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat || ""}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Články</CardTitle>
          <CardDescription>
            Zobrazeno {filteredArticles.length} z {articles.length} článků
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-purple-400"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center p-12 bg-secondary rounded-lg border border-border">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Žádné články nebyly nalezeny</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow className="hover:bg-secondary/80">
                    <TableHead className="font-semibold">Název</TableHead>
                    <TableHead className="font-semibold">Kategorie</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Aktualizováno</TableHead>
                    <TableHead className="text-right font-semibold">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-accent">
                      <TableCell className="font-medium">
                        <div>
                          <div>{article.title}</div>
                          {article.excerpt && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.category && (
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.updatedAt).toLocaleDateString("cs-CZ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditArticle?.(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
