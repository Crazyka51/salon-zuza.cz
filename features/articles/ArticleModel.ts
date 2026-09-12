import { BaseModel } from "@/admin-kit/api/models/BaseModel"
import type { Article, ArticleFormData } from "./types"

export class ArticleModel extends BaseModel<Article> {
  constructor() {
    super("articles")
  }

  async findMany(params: any): Promise<{ data: Article[]; total: number }> {
    // Mock implementation - replace with real database queries
    const mockArticles: Article[] = [
      {
        id: "1",
        title: "Vítejte v našem CMS systému",
        slug: "vitejte-v-nasem-cms-systemu",
        content: "<p>Toto je ukázkový článek v našem CMS systému...</p>",
        excerpt: "Úvodní článek představující náš CMS systém",
        status: "published",
        categoryId: "1",
        authorId: "1",
        featuredImage: "/images/welcome.jpg",
        tags: ["cms", "uvod", "system"],
        metaTitle: "Vítejte v CMS",
        metaDescription: "Představení našeho CMS systému",
        publishedAt: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        viewCount: 150,
        isSticky: true,
      },
      {
        id: "2", 
        title: "Jak vytvořit skvělý obsah",
        slug: "jak-vytvorit-skvely-obsah",
        content: "<p>Tipy a triky pro tvorbu kvalitního obsahu...</p>",
        excerpt: "Praktické rady pro content marketing",
        status: "published",
        categoryId: "2",
        authorId: "1",
        featuredImage: "/images/content-tips.jpg",
        tags: ["obsah", "marketing", "tipy"],
        publishedAt: new Date("2024-01-20"),
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
        viewCount: 89,
        isSticky: false,
      },
      {
        id: "3",
        title: "Optimalizace SEO pro články",
        slug: "optimalizace-seo-pro-clanky",
        content: "<p>Komplexní průvodce SEO optimalizací...</p>",
        excerpt: "Jak optimalizovat články pro vyhledávače",
        status: "draft",
        categoryId: "2",
        authorId: "1",
        tags: ["seo", "optimalizace", "vyhledavace"],
        metaTitle: "SEO optimalizace článků",
        metaDescription: "Průvodce SEO optimalizací pro lepší viditelnost",
        createdAt: new Date("2024-01-25"),
        updatedAt: new Date("2024-01-25"),
        viewCount: 0,
        isSticky: false,
      },
    ]

    // Simple filtering and pagination
    let filtered = [...mockArticles]
    
    if (params.search) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(params.search.toLowerCase()) ||
        article.content.toLowerCase().includes(params.search.toLowerCase())
      )
    }

    if (params.status) {
      filtered = filtered.filter(article => article.status === params.status)
    }

    if (params.categoryId) {
      filtered = filtered.filter(article => article.categoryId === params.categoryId)
    }

    // Sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Article]
        const bVal = b[params.sortBy as keyof Article]
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return params.sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
        }
        
        if (aVal instanceof Date && bVal instanceof Date) {
          return params.sortOrder === 'desc' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime()
        }
        
        return 0
      })
    }

    // Pagination
    const page = parseInt(params.page) || 1
    const limit = parseInt(params.limit) || 10
    const offset = (page - 1) * limit
    const paginatedData = filtered.slice(offset, offset + limit)

    return {
      data: paginatedData,
      total: filtered.length,
    }
  }

  async findById(id: string): Promise<Article | null> {
    const { data } = await this.findMany({})
    return data.find(article => article.id === id) || null
  }

  async create(data: Partial<Article>): Promise<Article> {
    const formData = data as ArticleFormData
    const newArticle: Article = {
      id: `article_${Date.now()}`,
      title: formData.title || "",
      slug: formData.slug || this.generateSlug(formData.title || ""),
      content: formData.content || "",
      excerpt: formData.excerpt,
      status: formData.status || "draft",
      categoryId: formData.categoryId,
      authorId: "1", // In real app, get from session
      featuredImage: formData.featuredImage,
      tags: formData.tags || [],
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      isSticky: formData.isSticky || false,
    }

    console.log("Creating article:", newArticle)
    return newArticle
  }

  async update(id: string, data: Partial<Article>): Promise<Article> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error("Article not found")
    }

    const updatedArticle: Article = {
      ...existing,
      ...data,
      slug: data.slug || (data.title ? this.generateSlug(data.title) : existing.slug),
      updatedAt: new Date(),
    }

    console.log("Updating article:", updatedArticle)
    return updatedArticle
  }

  async delete(id: string): Promise<{ id: string; deleted: boolean }> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error("Article not found")
    }

    console.log("Deleting article:", id)
    return { id, deleted: true }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove duplicate hyphens
      .trim()
  }

  // Article-specific methods
  async publish(id: string): Promise<Article> {
    return this.update(id, { 
      status: "published",
      publishedAt: new Date()
    })
  }

  async unpublish(id: string): Promise<Article> {
    return this.update(id, { status: "draft" })
  }

  async archive(id: string): Promise<Article> {
    return this.update(id, { status: "archived" })
  }

  async incrementViewCount(id: string): Promise<void> {
    const article = await this.findById(id)
    if (article) {
      await this.update(id, { viewCount: article.viewCount + 1 })
    }
  }
}