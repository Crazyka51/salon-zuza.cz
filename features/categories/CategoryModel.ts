import { BaseModel } from "@/admin-kit/api/models/BaseModel"
import type { Category, CategoryFormData } from "../articles/types"

export class CategoryModel extends BaseModel<Category> {
  constructor() {
    super("categories")
  }

  async findMany(params: any): Promise<{ data: Category[]; total: number }> {
    // Mock implementation - replace with real database queries
    const mockCategories: Category[] = [
      {
        id: "1",
        name: "Technologie",
        slug: "technologie",
        description: "Články o technologiích, programování a IT novinkách",
        parentId: undefined,
        color: "#3b82f6",
        image: "/images/categories/tech.jpg",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        articleCount: 15,
      },
      {
        id: "2",
        name: "Marketing",
        slug: "marketing", 
        description: "Digital marketing, SEO, reklama a growth hacking",
        parentId: undefined,
        color: "#10b981",
        image: "/images/categories/marketing.jpg",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
        articleCount: 8,
      },
      {
        id: "3",
        name: "Design",
        slug: "design",
        description: "UI/UX design, grafický design a kreativní procesy",
        parentId: undefined,
        color: "#f59e0b",
        image: "/images/categories/design.jpg",
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-03"),
        articleCount: 12,
      },
      {
        id: "4",
        name: "Web Development",
        slug: "web-development",
        description: "Frontend a backend vývoj webových aplikací",
        parentId: "1", // Child of Technologie
        color: "#8b5cf6",
        createdAt: new Date("2024-01-04"),
        updatedAt: new Date("2024-01-04"),
        articleCount: 6,
      },
      {
        id: "5",
        name: "Business",
        slug: "business",
        description: "Podnikání, startup tipy a business strategie",
        parentId: undefined,
        color: "#ef4444",
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-05"), 
        articleCount: 4,
      },
    ]

    // Simple filtering and pagination
    let filtered = [...mockCategories]
    
    if (params.search) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(params.search.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(params.search.toLowerCase()))
      )
    }

    if (params.parentId !== undefined) {
      filtered = filtered.filter(category => category.parentId === params.parentId)
    }

    // Sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Category]
        const bVal = b[params.sortBy as keyof Category]
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return params.sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return params.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
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

  async findById(id: string): Promise<Category | null> {
    const { data } = await this.findMany({})
    return data.find(category => category.id === id) || null
  }

  async create(data: Partial<Category>): Promise<Category> {
    const formData = data as CategoryFormData
    const newCategory: Category = {
      id: `category_${Date.now()}`,
      name: formData.name || "",
      slug: formData.slug || this.generateSlug(formData.name || ""),
      description: formData.description,
      parentId: formData.parentId,
      color: formData.color || "#6b7280",
      image: formData.image,
      createdAt: new Date(),
      updatedAt: new Date(),
      articleCount: 0,
    }

    console.log("Creating category:", newCategory)
    return newCategory
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error("Category not found")
    }

    const updatedCategory: Category = {
      ...existing,
      ...data,
      slug: data.slug || (data.name ? this.generateSlug(data.name) : existing.slug),
      updatedAt: new Date(),
    }

    console.log("Updating category:", updatedCategory)
    return updatedCategory
  }

  async delete(id: string): Promise<{ id: string; deleted: boolean }> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error("Category not found")
    }

    // Check if category has children
    const { data: children } = await this.findMany({ parentId: id })
    if (children.length > 0) {
      throw new Error("Cannot delete category with subcategories")
    }

    console.log("Deleting category:", id)
    return { id, deleted: true }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove duplicate hyphens
      .trim()
  }

  // Category-specific methods
  async getTopLevel(): Promise<Category[]> {
    const { data } = await this.findMany({ parentId: null })
    return data
  }

  async getChildren(parentId: string): Promise<Category[]> {
    const { data } = await this.findMany({ parentId })
    return data
  }

  async getHierarchy(): Promise<Category[]> {
    const { data: allCategories } = await this.findMany({})
    
    // Build hierarchy tree
    const buildTree = (parentId?: string): Category[] => {
      return allCategories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id)
        }))
    }

    return buildTree()
  }

  async updateArticleCount(categoryId: string): Promise<void> {
    // In real implementation, count articles in this category
    console.log("Updating article count for category:", categoryId)
  }
}