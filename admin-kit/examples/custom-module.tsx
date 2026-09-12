"use client"

// Example of creating a custom admin module

import { useState } from "react"
import { TableViewer } from "../ui/TableViewer"
import type { TableColumn, FormField } from "../core/types"

// Define your data structure
interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock: boolean
  createdAt: string
}

// Define table columns
const productColumns: TableColumn[] = [
  { key: "name", label: "Product Name", type: "text", sortable: true, filterable: true },
  { key: "price", label: "Price", type: "number", sortable: true },
  { key: "category", label: "Category", type: "text", sortable: true, filterable: true },
  { key: "inStock", label: "In Stock", type: "boolean", sortable: true },
  { key: "createdAt", label: "Created", type: "date", sortable: true },
]

// Define form fields
const productFormFields: FormField[] = [
  { name: "name", label: "Product Name", type: "text", required: true },
  { name: "price", label: "Price", type: "number", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { value: "electronics", label: "Electronics" },
      { value: "clothing", label: "Clothing" },
      { value: "books", label: "Books" },
    ],
  },
  { name: "inStock", label: "In Stock", type: "checkbox" },
]

// Custom module component
export function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateProduct = async (data: Record<string, any>) => {
    // Your create logic here
    console.log("Creating product:", data)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory</p>
      </div>

      <TableViewer
        key={refreshKey}
        title="Products"
        columns={productColumns}
        apiEndpoint="/products"
        searchable
        filterable
        pagination
        actions={[
          {
            id: "edit",
            label: "Edit",
            onClick: (product) => console.log("Edit", product),
            permission: "products.update",
          },
          {
            id: "delete",
            label: "Delete",
            onClick: (product) => console.log("Delete", product),
            permission: "products.delete",
            variant: "destructive",
          },
        ]}
      />
    </div>
  )
}
