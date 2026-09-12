"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronUp, ChevronDown, Search, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import type { TableColumn, ApiResponse } from "../../core/types"
import { useAdminApi } from "../../core/hooks/useAdminApi"
import { RoleGuard } from "../../core/auth/RoleGuard"

interface TableViewerProps {
  title?: string
  columns: TableColumn[]
  apiEndpoint: string
  actions?: TableAction[]
  searchable?: boolean
  filterable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: any) => void
  onSelectionChange?: (selectedRows: any[]) => void
  permissions?: {
    read?: string
    create?: string
    update?: string
    delete?: string
  }
  className?: string
}

interface TableAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: any) => void
  permission?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  show?: (row: any) => boolean
}

interface SortConfig {
  key: string
  direction: "asc" | "desc"
}

export function TableViewer({
  title,
  columns,
  apiEndpoint,
  actions = [],
  searchable = true,
  filterable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onSelectionChange,
  permissions,
  className,
}: TableViewerProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})

  const api = useAdminApi()

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortConfig) {
        params.append("sortBy", sortConfig.key)
        params.append("sortOrder", sortConfig.direction)
      }
      if (pagination) {
        params.append("page", currentPage.toString())
        params.append("limit", pageSize.toString())
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(`filter[${key}]`, value)
      })

      const queryString = params.toString()
      const endpoint = queryString ? `${apiEndpoint}?${queryString}` : apiEndpoint

      const response: ApiResponse = await api.get(endpoint)

      if (response.success) {
        setData(response.data)
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages)
        }
      } else {
        throw new Error(response.message || "Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [apiEndpoint, searchTerm, sortConfig, currentPage, filters])

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column?.sortable) return

    setSortConfig((current) => {
      if (current?.key === columnKey) {
        return current.direction === "asc" ? { key: columnKey, direction: "desc" } : null
      }
      return { key: columnKey, direction: "asc" }
    })
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows([...data])
    } else {
      setSelectedRows([])
    }
    onSelectionChange?.(checked ? [...data] : [])
  }

  const handleSelectRow = (row: any, checked: boolean) => {
    const newSelection = checked ? [...selectedRows, row] : selectedRows.filter((r) => r.id !== row.id)
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  // Render cell content
  const renderCell = (column: TableColumn, value: any, row: any) => {
    if (column.render) {
      return column.render(value, row)
    }

    switch (column.type) {
      case "boolean":
        return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
      case "date":
        return value ? new Date(value).toLocaleDateString() : "-"
      case "image":
        return value ? <img src={value || "/zajac.jpg"} alt="" className="h-8 w-8 rounded object-cover" /> : "-"
      case "number":
        return typeof value === "number" ? value.toLocaleString() : value
      default:
        return value || "-"
    }
  }

  // Filterable columns
  const filterableColumns = columns.filter((col) => col.filterable)

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <RoleGuard permissions={permissions?.create ? [permissions.create] : []}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </RoleGuard>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent>
        {/* Search and Filters */}
        {(searchable || filterable) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {filterable && filterableColumns.length > 0 && (
              <div className="flex gap-2">
                {filterableColumns.map((column) => (
                  <Select
                    key={column.key}
                    value={filters[column.key] || "all"} // Updated default value to "all"
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, [column.key]: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={`Filter ${column.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {column.label}</SelectItem>
                      {/* You would populate these options based on your data */}
                    </SelectContent>
                  </Select>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selection Actions */}
        {selectable && selectedRows.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`h-3 w-3 ${
                              sortConfig?.key === column.key && sortConfig.direction === "asc"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <ChevronDown
                            className={`h-3 w-3 -mt-1 ${
                              sortConfig?.key === column.key && sortConfig.direction === "desc"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead className="w-12">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                    <div className="text-center py-8 text-muted-foreground">No data found</div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.some((r) => r.id === row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>{renderCell(column, row[column.key], row)}</TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions
                              .filter((action) => !action.show || action.show(row))
                              .map((action) => (
                                <RoleGuard key={action.id} permissions={action.permission ? [action.permission] : []}>
                                  <DropdownMenuItem onClick={() => action.onClick(row)}>
                                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                                    {action.label}
                                  </DropdownMenuItem>
                                </RoleGuard>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
