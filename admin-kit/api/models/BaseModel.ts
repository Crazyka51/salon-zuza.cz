// Base model class for database operations
export abstract class BaseModel<T = any> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  // Abstract methods that must be implemented by concrete models
  abstract findMany(params: QueryParams): Promise<{ data: T[]; total: number }>
  abstract findById(id: string): Promise<T | null>
  abstract create(data: Partial<T>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<{ id: string; deleted: boolean }>

  // Common utility methods
  protected buildWhereClause(filters: Record<string, string>): string {
    const conditions = Object.entries(filters)
      .filter(([_, value]) => value && value !== "all")
      .map(([key, value]) => `${key} = '${value}'`)

    return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  }

  protected buildOrderClause(sortBy?: string, sortOrder: "asc" | "desc" = "asc"): string {
    return sortBy ? `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}` : ""
  }

  protected buildLimitClause(page = 1, limit = 10): string {
    const offset = (page - 1) * limit
    return `LIMIT ${limit} OFFSET ${offset}`
  }
}

interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filters?: Record<string, string>
}
