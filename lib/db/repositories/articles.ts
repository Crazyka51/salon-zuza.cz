/**
 * Articles repository - handles all database operations for articles
 * Uses Neon template literal syntax for type safety
 */

import { sql } from '../connection'

export interface Article {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: 'draft' | 'published' | 'archived' | 'scheduled'
  category_id: number | null
  author_id: number
  featured_image: string | null
  tags: string[]
  meta_title: string | null
  meta_description: string | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
  view_count: number
  is_sticky: boolean
}

export interface ArticleWithRelations extends Article {
  category?: {
    id: number
    name: string
    slug: string
    color: string
  }
  author?: {
    id: number
    name: string
    email: string
  }
}

/**
 * Get all articles with optional filters
 */
export async function getArticles(options: {
  search?: string
  status?: string
  category?: number
  limit?: number
  offset?: number
} = {}) {
  const {
    search,
    status,
    category,
    limit = 10,
    offset = 0
  } = options

  // Base query with relations
  let query = sql`
    SELECT 
      a.*,
      c.id as category_id,
      c.name as category_name,
      c.slug as category_slug,
      c.color as category_color,
      u.id as author_id,
      u.name as author_name,
      u.email as author_email
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN admin_users u ON a.author_id = u.id
  `

  // Apply filters dynamically
  if (status && search && category) {
    const searchPattern = `%${search}%`
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      WHERE a.status = ${status}
        AND a.category_id = ${category}
        AND (a.title ILIKE ${searchPattern} OR a.content ILIKE ${searchPattern})
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (status && search) {
    const searchPattern = `%${search}%`
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      WHERE a.status = ${status}
        AND (a.title ILIKE ${searchPattern} OR a.content ILIKE ${searchPattern})
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (status && category) {
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      WHERE a.status = ${status} AND a.category_id = ${category}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (status) {
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      WHERE a.status = ${status}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (search) {
    const searchPattern = `%${search}%`
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      WHERE a.title ILIKE ${searchPattern} OR a.content ILIKE ${searchPattern}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (category) {
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      WHERE a.category_id = ${category}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else {
    query = sql`
      SELECT 
        a.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        u.id as author_id,
        u.name as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  }

  const articles = await query

  // Get total count with same filters
  let countQuery
  if (status && search && category) {
    const searchPattern = `%${search}%`
    countQuery = sql`
      SELECT COUNT(*) as total FROM articles
      WHERE status = ${status}
        AND category_id = ${category}
        AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
    `
  } else if (status && search) {
    const searchPattern = `%${search}%`
    countQuery = sql`
      SELECT COUNT(*) as total FROM articles
      WHERE status = ${status}
        AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
    `
  } else if (status && category) {
    countQuery = sql`
      SELECT COUNT(*) as total FROM articles
      WHERE status = ${status} AND category_id = ${category}
    `
  } else if (status) {
    countQuery = sql`SELECT COUNT(*) as total FROM articles WHERE status = ${status}`
  } else if (search) {
    const searchPattern = `%${search}%`
    countQuery = sql`
      SELECT COUNT(*) as total FROM articles
      WHERE title ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
    `
  } else if (category) {
    countQuery = sql`SELECT COUNT(*) as total FROM articles WHERE category_id = ${category}`
  } else {
    countQuery = sql`SELECT COUNT(*) as total FROM articles`
  }

  const countResult = await countQuery
  const total = Number(countResult[0]?.total || 0)

  return {
    data: articles.map(formatArticleWithRelations),
    pagination: {
      limit,
      offset,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Get article by ID with relations
 */
export async function getArticleById(id: number): Promise<ArticleWithRelations | null> {
  const result = await sql`
    SELECT 
      a.*,
      c.id as category_id,
      c.name as category_name,
      c.slug as category_slug,
      c.color as category_color,
      u.id as author_id,
      u.name as author_name,
      u.email as author_email
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN admin_users u ON a.author_id = u.id
    WHERE a.id = ${id}
  `

  return result.length > 0 ? formatArticleWithRelations(result[0]) : null
}

/**
 * Get article by slug with relations
 */
export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  const result = await sql`
    SELECT 
      a.*,
      c.id as category_id,
      c.name as category_name,
      c.slug as category_slug,
      c.color as category_color,
      u.id as author_id,
      u.name as author_name,
      u.email as author_email
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN admin_users u ON a.author_id = u.id
    WHERE a.slug = ${slug}
  `

  return result.length > 0 ? formatArticleWithRelations(result[0]) : null
}

/**
 * Create new article
 */
export async function createArticle(data: Partial<Article>) {
  const tags = JSON.stringify(data.tags || [])
  
  const result = await sql`
    INSERT INTO articles (
      title, slug, content, excerpt, status, category_id, author_id,
      featured_image, tags, meta_title, meta_description, published_at
    ) VALUES (
      ${data.title},
      ${data.slug},
      ${data.content},
      ${data.excerpt || null},
      ${data.status || 'draft'},
      ${data.category_id || null},
      ${data.author_id},
      ${data.featured_image || null},
      ${tags},
      ${data.meta_title || null},
      ${data.meta_description || null},
      ${data.published_at || null}
    )
    RETURNING *
  `

  return result[0] as Article
}

/**
 * Update article
 */
export async function updateArticle(id: number, data: Partial<Article>) {
  const current = await getArticleById(id)
  if (!current) {
    throw new Error('Article not found')
  }

  const tags = data.tags ? JSON.stringify(data.tags) : JSON.stringify(current.tags)

  const result = await sql`
    UPDATE articles SET
      title = ${data.title ?? current.title},
      slug = ${data.slug ?? current.slug},
      content = ${data.content ?? current.content},
      excerpt = ${data.excerpt ?? current.excerpt},
      status = ${data.status ?? current.status},
      category_id = ${data.category_id ?? current.category_id},
      featured_image = ${data.featured_image ?? current.featured_image},
      tags = ${tags},
      meta_title = ${data.meta_title ?? current.meta_title},
      meta_description = ${data.meta_description ?? current.meta_description},
      published_at = ${data.published_at ?? current.published_at},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `

  return result[0] as Article
}

/**
 * Delete article
 */
export async function deleteArticle(id: number): Promise<boolean> {
  await sql`DELETE FROM articles WHERE id = ${id}`
  return true
}

/**
 * Increment view count
 */
export async function incrementViewCount(id: number) {
  await sql`UPDATE articles SET view_count = view_count + 1 WHERE id = ${id}`
}

/**
 * Get article statistics
 */
export async function getArticleStats() {
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'published') as published,
      COUNT(*) FILTER (WHERE status = 'draft') as draft,
      COUNT(*) FILTER (WHERE status = 'archived') as archived,
      SUM(view_count) as total_views
    FROM articles
  `

  return {
    total: Number(result[0]?.total || 0),
    published: Number(result[0]?.published || 0),
    draft: Number(result[0]?.draft || 0),
    archived: Number(result[0]?.archived || 0),
    totalViews: Number(result[0]?.total_views || 0)
  }
}

/**
 * Helper function to format article with relations
 */
function formatArticleWithRelations(row: any): ArticleWithRelations {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    status: row.status,
    category_id: row.category_id,
    author_id: row.author_id,
    featured_image: row.featured_image,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    view_count: row.view_count,
    is_sticky: row.is_sticky,
    category: row.category_name ? {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
      color: row.category_color
    } : undefined,
    author: row.author_name ? {
      id: row.author_id,
      name: row.author_name,
      email: row.author_email
    } : undefined
  }
}
