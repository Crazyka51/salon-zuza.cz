# Admin Kit - Modular Next.js Admin System

A comprehensive, modular admin system for Next.js applications with built-in authentication, CRUD operations, and extensible architecture.

## Features

- 🔐 **Authentication & Authorization** - Built-in auth with role-based permissions
- 📊 **Dynamic Tables** - Sortable, filterable, paginated data tables
- 📝 **Dynamic Forms** - Auto-generated forms from schema definitions
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🔌 **Modular Architecture** - Easy to extend with custom modules
- 🚀 **Next.js Native** - Optimized for Next.js App Router
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Theme Support** - Light, dark, and system themes

## Quick Start

### 1. Installation

Copy the `admin-kit` folder into your Next.js project:

\`\`\`
your-project/
├── admin-kit/
├── app/
├── components/
└── ...
\`\`\`

### 2. Basic Setup

Create the admin catch-all route:

\`\`\`typescript
// app/admin/[[...slug]]/page.tsx
import { AdminCatchAllPage } from "./AdminCatchAllPage"

export default function AdminPage({ params }: { params: { slug?: string[] } }) {
  return <AdminCatchAllPage slug={params.slug || []} />
}
\`\`\`

### 3. API Routes

Create the API handler:

\`\`\`typescript
// app/api/admin/[...api]/route.ts
import { adminApiHandler } from "../../../../admin-kit/api/handler"

export async function GET(request: Request) {
  return adminApiHandler(request as any)
}
// ... other HTTP methods
\`\`\`

### 4. Proxy (Auth guard)

Přidejte autentizaci do proxy:

\`\`\`typescript
// proxy.ts
import { AdminAuthProxy } from "./admin-kit/core/auth/proxy"

export async function proxy(request: NextRequest) {
  // Authentication logic
}
\`\`\`

## Configuration

Configure your admin panel:

\`\`\`typescript
const adminConfig: Partial<AdminConfig> = {
  title: "My Admin Panel",
  theme: "system",
  navigation: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      icon: "Home",
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users",
      icon: "Users",
      permission: "users.read",
    },
  ],
  auth: {
    provider: "custom",
    loginPath: "/admin/login",
    permissions: true,
  },
}
\`\`\`

## Creating Custom Modules

1. **Create Module Component**:

\`\`\`typescript
// admin-kit/modules/products/ProductsPage.tsx
export function ProductsPage() {
  return (
    <TableViewer
      columns={productColumns}
      apiEndpoint="/products"
      // ... other props
    />
  )
}
\`\`\`

2. **Add to Module Registry**:

\`\`\`typescript
// admin-kit/modules/index.ts
export const customModules = [
  {
    id: "products",
    name: "Products",
    path: "/admin/products",
    component: "ProductsPage",
    permissions: ["products.read"],
  },
]
\`\`\`

## API Integration

The system provides automatic CRUD APIs:

\`\`\`typescript
// GET /api/admin/users - List users
// POST /api/admin/users - Create user
// GET /api/admin/users/123 - Get user
// PUT /api/admin/users/123 - Update user
// DELETE /api/admin/users/123 - Delete user
\`\`\`

## Permissions

Define granular permissions:

\`\`\`typescript
const permissions = {
  USERS: {
    READ: "users.read",
    CREATE: "users.create",
    UPDATE: "users.update",
    DELETE: "users.delete",
  },
}
\`\`\`

## Customization

### Custom Components

Override default components:

\`\`\`typescript
import { FormGenerator } from "admin-kit/ui/FormGenerator"

// Use with custom fields
<FormGenerator
  fields={customFields}
  onSubmit={handleSubmit}
  layout="grid"
  columns={2}
/>
\`\`\`

### Custom Styling

The system uses Tailwind CSS and can be customized through your theme configuration.

## Architecture

\`\`\`
admin-kit/
├── core/           # Core functionality
│   ├── auth/       # Authentication system
│   ├── context/    # React context providers
│   ├── hooks/      # Custom React hooks
│   ├── layout/     # Layout components
│   └── types.ts    # TypeScript definitions
├── ui/             # UI components
│   ├── Dashboard/  # Dashboard component
│   ├── FormGenerator/ # Dynamic forms
│   └── TableViewer/   # Dynamic tables
├── modules/        # Admin modules
│   ├── users/      # User management
│   ├── posts/      # Post management
│   └── settings/   # Settings
├── api/            # API handlers
│   ├── auth.ts     # Auth endpoints
│   ├── crud.ts     # CRUD operations
│   └── handler.ts  # Main API handler
└── utils/          # Utility functions
\`\`\`

## License

MIT License - feel free to use in your projects!
