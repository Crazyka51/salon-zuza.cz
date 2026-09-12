/**
 * Categories repository - handles all database operations for categories
 * Uses Neon template literal syntax for type safety
 */

import { sql } from '../connection'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  color: string
  image: string | null
  created_at: Date
  updated_at: Date
}

export interface CategoryWithCount extends Category {
  article_count: number
}

/**
 * Get all categories with article counts
 */
export async function getCategories(options: {
  limit?: number
  offset?: number
} = {}) {
  const { limit = 50, offset = 0 } = options

  const categories = await sql`
    SELECT 
      c.*,
      COUNT(a.id)::int as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
    LIMIT ${limit} OFFSET ${offset}
  `

  const countResult = await sql`SELECT COUNT(*) as total FROM categories`

  return {
    data: categories as CategoryWithCount[],
    total: Number(countResult[0]?.total || 0)
  }
}

/**
 * Get category by ID with article count
 */
export async function getCategoryById(id: number): Promise<CategoryWithCount | null> {
  const result = await sql`
    SELECT 
      c.*,
      COUNT(a.id)::int as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    WHERE c.id = ${id}
    GROUP BY c.id
  `

  return result.length > 0 ? (result[0] as CategoryWithCount) : null
}

/**
 * Get category by slug with article count
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const result = await sql`
    SELECT 
      c.*,
      COUNT(a.id)::int as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    WHERE c.slug = ${slug}
    GROUP BY c.id
  `

  return result.length > 0 ? (result[0] as CategoryWithCount) : null
}

/**
 * Get hierarchical categories (parent with children)
 */
export async function getCategoriesHierarchical() {
  const allCategories = await sql`
    SELECT 
      c.*,
      COUNT(a.id)::int as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `

  // Build hierarchy
  const categoriesMap = new Map()
  const rootCategories: any[] = []

  allCategories.forEach((cat: any) => {
    categoriesMap.set(cat.id, { ...cat, children: [] })
  })

  allCategories.forEach((cat: any) => {
    const category = categoriesMap.get(cat.id)
    if (cat.parent_id) {
      const parent = categoriesMap.get(cat.parent_id)
      if (parent) {
        parent.children.push(category)
      }
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}

/**
 * Create new category
 */
export async function createCategory(data: Partial<Category>) {
  const result = await sql`
    INSERT INTO categories (name, slug, description, parent_id, color, image)
    VALUES (
      ${data.name}, 
      ${data.slug}, 
      ${data.description || null}, 
      ${data.parent_id || null}, 
      ${data.color || '#6b7280'}, 
      ${data.image || null}
    )
    RETURNING *
  `

  return result[0] as Category
}

/**
 * Update category
 */
export async function updateCategory(id: number, data: Partial<Category>) {
  // Get current category
  const current = await getCategoryById(id)
  if (!current) {
    throw new Error('Category not found')
  }

  const result = await sql`
    UPDATE categories SET
      name = ${data.name ?? current.name},
      slug = ${data.slug ?? current.slug},
      description = ${data.description ?? current.description},
      parent_id = ${data.parent_id ?? current.parent_id},
      color = ${data.color ?? current.color},
      image = ${data.image ?? current.image},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `

  return result[0] as Category
}

/**
 * Delete category (only if no articles)
 */
export async function deleteCategory(id: number): Promise<boolean> {
  // Check if category has articles
  const articlesCount = await sql`
    SELECT COUNT(*) as count FROM articles WHERE category_id = ${id}
  `

  if (Number(articlesCount[0]?.count || 0) > 0) {
    throw new Error('Cannot delete category with articles')
  }

  await sql`DELETE FROM categories WHERE id = ${id}`
  return true
}

/**
 * Get category statistics
 */
export async function getCategoryStats() {
  const result = await sql`
    SELECT 
      COUNT(*) as total_categories,
      COUNT(*) FILTER (WHERE parent_id IS NULL) as root_categories,
      COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as sub_categories
    FROM categories
  `

  return {
    total: Number(result[0]?.total_categories || 0),
    root: Number(result[0]?.root_categories || 0),
    sub: Number(result[0]?.sub_categories || 0)
  }
}
