"use client"

import { useState, useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  Eye, 
  Send, 
  Image, 
  Tag, 
  Calendar, 
  Globe, 
  FileText,
  AlertCircle
} from "lucide-react"
import type { ArticleFormData, ArticleStatus } from "./types"

const articleSchema: z.ZodType<ArticleFormData> = z.object({
  title: z.string().min(1, "Název je povinný").max(200, "Název je příliš dlouhý"),
  slug: z.string().optional(),
  content: z.string().min(1, "Obsah je povinný"),
  excerpt: z.string().max(300, "Excerpt je příliš dlouhý").optional(),
  status: z.enum(["draft", "published", "archived", "scheduled"]),
  categoryId: z.string().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()),
  metaTitle: z.string().max(60, "Meta titulek je příliš dlouhý").optional(),
  metaDescription: z.string().max(160, "Meta popis je příliš dlouhý").optional(),
  publishedAt: z.string().optional(),
  isSticky: z.boolean(),
})

// Keep the resolver boundary explicit; newer TypeScript versions otherwise expand
// the Zod/RHF generic types beyond the compiler's instantiation limit.
const createArticleResolver = zodResolver as unknown as (
  schema: typeof articleSchema
) => Resolver<ArticleFormData>

interface ArticleEditorProps {
  articleId?: string
  initialData?: Partial<ArticleFormData>
}

export function ArticleEditor({ articleId, initialData }: ArticleEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [previewMode, setPreviewMode] = useState(false)

  const form = useForm<ArticleFormData>({
    resolver: createArticleResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
      categoryId: "",
      featuredImage: "",
      tags: [],
      metaTitle: "",
      metaDescription: "",
      publishedAt: "",
      isSticky: false,
      ...initialData,
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form
  const watchedTitle = watch("title")
  const watchedTags = watch("tags")
  const watchedStatus = watch("status")

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !articleId) {
      const slug = watchedTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setValue("slug", slug)
    }
  }, [watchedTitle, setValue, articleId])

  const onSubmit = async (data: ArticleFormData) => {
    setIsSaving(true)
    try {
      const url = articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles"
      const method = articleId ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Chyba při ukládání článku")

      // Redirect or show success message
      console.log("Article saved successfully")
      
    } catch (error) {
      console.error("Error saving article:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue("tags", [...watchedTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue("tags", watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleQuickSave = async () => {
    const data = form.getValues()
    await onSubmit({ ...data, status: "draft" })
  }

  const handlePublish = async () => {
    const data = form.getValues()
    await onSubmit({ ...data, status: "published" })
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {articleId ? "Upravit článek" : "Nový článek"}
          </h1>
          <p className="text-muted-foreground">
            {articleId ? "Upravte existující článek" : "Vytvořte nový článek pro váš web"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Editor" : "Náhled"}
          </Button>
          <Button variant="outline" onClick={handleQuickSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Uložit koncept
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            <Send className="mr-2 h-4 w-4" />
            {watchedStatus === "published" ? "Aktualizovat" : "Publikovat"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Obsah článku
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Název článku *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Zadejte název článku..."
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    {...register("slug")}
                    placeholder="url-slug-clanku"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Automaticky generováno z názvu
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Krátký popis (excerpt)</Label>
                  <Textarea
                    id="excerpt"
                    {...register("excerpt")}
                    placeholder="Krátký popis článku pro zobrazení v přehledech..."
                    rows={3}
                    className={errors.excerpt ? "border-red-500" : ""}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">{errors.excerpt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Obsah článku *</Label>
                  <Textarea
                    id="content"
                    {...register("content")}
                    placeholder="Zde napište obsah vašeho článku..."
                    rows={20}
                    className={`min-h-[500px] ${errors.content ? "border-red-500" : ""}`}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    💡 Tip: Použijte Markdown pro formátování textu
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  SEO optimalizace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta titulek</Label>
                  <Input
                    id="metaTitle"
                    {...register("metaTitle")}
                    placeholder="SEO titulek pro vyhledávače..."
                    maxLength={60}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Doporučená délka: 50-60 znaků
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta popis</Label>
                  <Textarea
                    id="metaDescription"
                    {...register("metaDescription")}
                    placeholder="Popis článku pro vyhledávače..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Doporučená délka: 150-160 znaků
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Publikování
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={watchedStatus} onValueChange={(value: ArticleStatus) => setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Koncept</SelectItem>
                      <SelectItem value="published">Publikováno</SelectItem>
                      <SelectItem value="scheduled">Naplánováno</SelectItem>
                      <SelectItem value="archived">Archivováno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watchedStatus === "scheduled" && (
                  <div>
                    <Label htmlFor="publishedAt">Datum publikování</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      {...register("publishedAt")}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isSticky"
                    checked={watch("isSticky")}
                    onCheckedChange={(checked) => setValue("isSticky", checked)}
                  />
                  <Label htmlFor="isSticky">Připnout článek</Label>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Kategorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={watch("categoryId")} onValueChange={(value) => setValue("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategorii..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Technologie</SelectItem>
                    <SelectItem value="2">Marketing</SelectItem>
                    <SelectItem value="3">Design</SelectItem>
                    <SelectItem value="4">Business</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Štítky
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Přidat štítek..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Přidat
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="mr-2 h-5 w-5" />
                  Hlavní obrázek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  {...register("featuredImage")}
                  placeholder="URL obrázku..."
                />
                <Button type="button" variant="outline" className="w-full mt-2">
                  <Image className="mr-2 h-4 w-4" />
                  Nahrát obrázek
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}