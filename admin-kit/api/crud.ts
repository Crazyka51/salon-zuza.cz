import { type NextRequest, NextResponse } from "next/server"
import { requirePermission } from "../core/auth/proxy"
import type { ApiResponse, AdminUser } from "../core/types"

interface CrudModel {
  findMany: (params: QueryParams) => Promise<{ data: any[]; total: number }>
  findById: (id: string) => Promise<any>
  create: (data: any) => Promise<any>
  update: (id: string, data: any) => Promise<any>
  delete: (id: string) => Promise<any>
}

interface CrudOptions {
  permissions?: {
    read?: string
    create?: string
    update?: string
    delete?: string
  }
  model: CrudModel
  validation?: {
    create?: (data: any) => { success: boolean; errors?: Record<string, string> }
    update?: (data: any) => { success: boolean; errors?: Record<string, string> }
  }
  hooks?: {
    beforeCreate?: (data: any, user: AdminUser) => Promise<any>
    afterCreate?: (data: any, user: AdminUser) => Promise<void>
    beforeUpdate?: (id: string, data: any, user: AdminUser) => Promise<any>
    afterUpdate?: (id: string, data: any, user: AdminUser) => Promise<void>
    beforeDelete?: (id: string, user: AdminUser) => Promise<void>
    afterDelete?: (id: string, user: AdminUser) => Promise<void>
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

export function createCrudHandlers(resource: string, options: CrudOptions) {
  return async (request: NextRequest, pathSegments: string[], user: AdminUser): Promise<NextResponse> => {
    const [id, action] = pathSegments
    const method = request.method

    try {
      // Handle different CRUD operations
      if (method === "GET") {
        return handleRead(request, id, user, options)
      } else if (method === "POST") {
        return handleCreate(request, user, options)
      } else if (method === "PUT" || method === "PATCH") {
        return handleUpdate(request, id, user, options)
      } else if (method === "DELETE") {
        return handleDelete(request, id, user, options)
      } else {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Method not allowed",
          } as ApiResponse),
          { status: 405 },
        )
      }
    } catch (error) {
      console.error(`CRUD error for ${resource}:`, error)
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Internal server error",
        } as ApiResponse),
        { status: 500 },
      )
    }
  }
}

async function handleRead(
  request: NextRequest,
  id: string | undefined,
  user: AdminUser,
  options: CrudOptions,
): Promise<NextResponse> {
  // Check permissions
  if (options.permissions?.read && !requirePermission(user, options.permissions.read)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Insufficient permissions",
      } as ApiResponse),
      { status: 403 },
    )
  }

  if (id) {
    // Get single record
    const record = await options.model.findById(id)
    if (!record) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Record not found",
        } as ApiResponse),
        { status: 404 },
      )
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: record,
      } as ApiResponse),
    )
  } else {
    // Get multiple records with pagination and filtering
    const url = new URL(request.url)
    const queryParams: QueryParams = {
      page: Number.parseInt(url.searchParams.get("page") || "1"),
      limit: Number.parseInt(url.searchParams.get("limit") || "10"),
      search: url.searchParams.get("search") || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: (url.searchParams.get("sortOrder") as "asc" | "desc") || "asc",
      filters: {},
    }

    // Extract filters
    url.searchParams.forEach((value, key) => {
      if (key.startsWith("filter[") && key.endsWith("]")) {
        const filterKey = key.slice(7, -1)
        queryParams.filters![filterKey] = value
      }
    })

    const result = await options.model.findMany(queryParams)

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: result.data,
        pagination: {
          page: queryParams.page!,
          limit: queryParams.limit!,
          total: result.total,
          totalPages: Math.ceil(result.total / queryParams.limit!),
        },
      } as ApiResponse),
    )
  }
}

async function handleCreate(request: NextRequest, user: AdminUser, options: CrudOptions): Promise<NextResponse> {
  // Check permissions
  if (options.permissions?.create && !requirePermission(user, options.permissions.create)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Insufficient permissions",
      } as ApiResponse),
      { status: 403 },
    )
  }

  const body = await request.json()

  // Validate data
  if (options.validation?.create) {
    const validation = options.validation.create(body)
    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          data: null,
          message: "Validation failed",
          errors: validation.errors,
        } as ApiResponse),
        { status: 400 },
      )
    }
  }

  // Run before hook
  let processedData = body
  if (options.hooks?.beforeCreate) {
    processedData = await options.hooks.beforeCreate(body, user)
  }

  // Create record
  const record = await options.model.create(processedData)

  // Run after hook
  if (options.hooks?.afterCreate) {
    await options.hooks.afterCreate(record, user)
  }

  return new NextResponse(
    JSON.stringify({
      success: true,
      data: record,
      message: "Record created successfully",
    } as ApiResponse),
    { status: 201 },
  )
}

async function handleUpdate(
  request: NextRequest,
  id: string | undefined,
  user: AdminUser,
  options: CrudOptions,
): Promise<NextResponse> {
  if (!id) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "ID is required for update",
      } as ApiResponse),
      { status: 400 },
    )
  }

  // Check permissions
  if (options.permissions?.update && !requirePermission(user, options.permissions.update)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Insufficient permissions",
      } as ApiResponse),
      { status: 403 },
    )
  }

  const body = await request.json()

  // Validate data
  if (options.validation?.update) {
    const validation = options.validation.update(body)
    if (!validation.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          data: null,
          message: "Validation failed",
          errors: validation.errors,
        } as ApiResponse),
        { status: 400 },
      )
    }
  }

  // Run before hook
  let processedData = body
  if (options.hooks?.beforeUpdate) {
    processedData = await options.hooks.beforeUpdate(id, body, user)
  }

  // Update record
  const record = await options.model.update(id, processedData)

  // Run after hook
  if (options.hooks?.afterUpdate) {
    await options.hooks.afterUpdate(id, record, user)
  }

  return new NextResponse(
    JSON.stringify({
      success: true,
      data: record,
      message: "Record updated successfully",
    } as ApiResponse),
  )
}

async function handleDelete(
  request: NextRequest,
  id: string | undefined,
  user: AdminUser,
  options: CrudOptions,
): Promise<NextResponse> {
  if (!id) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "ID is required for delete",
      } as ApiResponse),
      { status: 400 },
    )
  }

  // Check permissions
  if (options.permissions?.delete && !requirePermission(user, options.permissions.delete)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Insufficient permissions",
      } as ApiResponse),
      { status: 403 },
    )
  }

  // Run before hook
  if (options.hooks?.beforeDelete) {
    await options.hooks.beforeDelete(id, user)
  }

  // Delete record
  const result = await options.model.delete(id)

  // Run after hook
  if (options.hooks?.afterDelete) {
    await options.hooks.afterDelete(id, user)
  }

  return new NextResponse(
    JSON.stringify({
      success: true,
      data: result,
      message: "Record deleted successfully",
    } as ApiResponse),
  )
}
