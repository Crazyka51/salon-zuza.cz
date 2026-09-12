import { adminApiHandler } from "../../../../admin-kit/api/handler"

// Handle all admin API routes through the catch-all handler
export async function GET(request: Request) {
  return adminApiHandler(request as any)
}

export async function POST(request: Request) {
  return adminApiHandler(request as any)
}

export async function PUT(request: Request) {
  return adminApiHandler(request as any)
}

export async function PATCH(request: Request) {
  return adminApiHandler(request as any)
}

export async function DELETE(request: Request) {
  return adminApiHandler(request as any)
}
