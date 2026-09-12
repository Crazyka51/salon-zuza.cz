/**
 * Database utility types and helpers
 */

/**
 * Generic database query result
 */
export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

/**
 * Filter parameters for queries
 */
export interface FilterParams {
  search?: string
  status?: string
  category?: string
  author?: string
  [key: string]: any
}

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Complete query parameters
 */
export interface QueryParams extends PaginationParams, FilterParams, SortParams {}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Build ORDER BY clause
 */
export function buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): string {
  if (!sortBy) return 'ORDER BY created_at DESC'
  
  // Whitelist allowed sort columns to prevent SQL injection
  const allowedColumns = [
    'id', 'title', 'name', 'email', 'created_at', 'updated_at', 
    'published_at', 'status', 'view_count'
  ]
  
  if (!allowedColumns.includes(sortBy)) {
    return 'ORDER BY created_at DESC'
  }
  
  return `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
}

/**
 * Build WHERE clause for search
 */
export function buildSearchCondition(
  search: string | undefined, 
  columns: string[]
): { condition: string; params: string[] } {
  if (!search || search.trim() === '') {
    return { condition: '', params: [] }
  }
  
  const searchPattern = `%${search.trim()}%`
  const conditions = columns.map((col, idx) => `${col} ILIKE $${idx + 1}`).join(' OR ')
  const params = columns.map(() => searchPattern)
  
  return {
    condition: `(${conditions})`,
    params
  }
}
