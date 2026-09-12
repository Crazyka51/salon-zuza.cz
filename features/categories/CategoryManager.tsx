"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Tag } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  display_order: number
  is_active: boolean
  parent_id?: string
  articleCount?: number
  createdAt: Date
  updatedAt: Date
}

// Mock data pro demonstraci
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Technologie",
    slug: "technologie",
    description: "Články o moderních technologiích a trendech",
    color: "#3B82F6",
    display_order: 0,
    is_active: true,
    articleCount: 15,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "2",
    name: "Programování",
    slug: "programovani",
    description: "Tutoriály a návody pro vývojáře",
    color: "#10B981",
    display_order: 1,
    is_active: true,
    articleCount: 23,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18")
  },
  {
    id: "3",
    name: "Design",
    slug: "design",
    description: "UI/UX design a vizuální tvorba",
    color: "#F59E0B",
    display_order: 2,
    is_active: true,
    articleCount: 12,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-19")
  },
  {
    id: "4",
    name: "Business",
    slug: "business",
    description: "Obchodní strategie a management",
    color: "#EF4444",
    display_order: 3,
    is_active: false,
    articleCount: 8,
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-15")
  }
]

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#3B82F6",
    display_order: 0,
    is_active: true,
  })

  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      // Simulace API volání
      await new Promise(resolve => setTimeout(resolve, 500))
      setCategories(mockCategories)
    } catch (error) {
      toast({
        title: "Chyba při načítání kategorií",
        description: "Nepodařilo se načíst kategorie",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update category
        const updatedCategories = categories.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, ...formData, updatedAt: new Date() }
            : cat
        )
        setCategories(updatedCategories)
        toast({ title: "Kategorie byla úspěšně aktualizována" })
      } else {
        // Create new category
        const newCategory: Category = {
          id: Date.now().toString(),
          ...formData,
          articleCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setCategories([...categories, newCategory])
        toast({ title: "Kategorie byla úspěšně vytvořena" })
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      resetForm()
    } catch (error) {
      toast({
        title: "Chyba při ukládání kategorie",
        description: "Došlo k neočekávané chybě",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      color: category.color || "#3B82F6",
      display_order: category.display_order,
      is_active: category.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm("Opravdu chcete smazat tuto kategorii?")) {
      try {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        toast({ title: "Kategorie byla úspěšně smazána" })
      } catch (error) {
        toast({
          title: "Chyba při mazání kategorie",
          description: "Došlo k neočekávané chybě",
          variant: "destructive",
        })
      }
    }
  }

  const handleNewCategory = () => {
    setEditingCategory(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      color: "#3B82F6",
      display_order: 0,
      is_active: true,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            Kategorie
          </h1>
          <p className="text-muted-foreground mt-1">Správa kategorií pro články</p>
        </div>
        <Button onClick={handleNewCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Nová kategorie
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="bg-card border-border hover:border-accent transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {!category.is_active && (
                    <Badge variant="outline" className="text-xs">Neaktivní</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    className="h-8 w-8 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {category.articleCount || 0} článků
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Slug: {category.slug}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Pořadí: {category.display_order}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Vytvořeno: {new Date(category.createdAt).toLocaleDateString("cs-CZ")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Žádné kategorie</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Začněte vytvořením první kategorie pro vaše články
            </p>
            <Button onClick={handleNewCategory}>
              Vytvořit první kategorii
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Upravit kategorii" : "Nová kategorie"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Název</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Název kategorie"
                required
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-slug-kategorie"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Bude použito v URL. Pokud necháte prázdné, vytvoří se automaticky.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Popis</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Krátký popis kategorie"
                rows={2}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Barva</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                  aria-label="Výběr barvy kategorie"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pořadí zobrazení</label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Nižší čísla se zobrazují jako první.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-border h-4 w-4 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Aktivní kategorie
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Zrušit
              </Button>
              <Button type="submit" className="flex-1">
                {editingCategory ? "Uložit" : "Vytvořit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
