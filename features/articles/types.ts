export type ArticleStatus = "draft" | "published" | "archived" | "scheduled"

export interface Article {
  id: string
  title: string
  slug?: string
  content: string
  excerpt?: string | null
  status: ArticleStatus
  categoryId?: string | null
  authorId?: string | null
  featuredImage?: string | null
  tags: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  publishedAt?: Date | string
  createdAt: Date
  updatedAt: Date
  viewCount: number
  isSticky: boolean
  category?: { id: string; name: string } | null
  author?: { id: string; name: string } | null
}

export interface ArticleFormData {
  title: string
  slug?: string
  content: string
  excerpt?: string
  status: ArticleStatus
  categoryId?: string
  featuredImage?: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  publishedAt?: string
  isSticky: boolean
}

export interface Category {
  id: string
  name: string
  description?: string | null
  parentId?: string | null
  slug?: string
  color?: string
  image?: string | null
  parent?: { id: string; name: string } | null
  articleCount?: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  parentId?: string
  color?: string
  image?: string
}