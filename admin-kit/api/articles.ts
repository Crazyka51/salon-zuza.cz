// API handler for articles
import type { NextRequest } from "next/server"
import { ArticleModel } from "@/features/articles/ArticleModel"
import { authenticateApiRequest } from "../core/auth/proxy"

const articleModel = new ArticleModel()

export async function handleArticlesApi(request: NextRequest, params: { api: string[] }) {
  const user = await authenticateApiRequest(request)
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const [resource, id] = params.api
  const method = request.method

  try {
    switch (method) {
      case "GET":
        if (id) {
          const article = await articleModel.findById(id)
          if (!article) {
            return new Response("Article not found", { status: 404 })
          }
          return Response.json({ success: true, data: article })
        } else {
          const url = new URL(request.url)
          const searchParams = Object.fromEntries(url.searchParams)
          const result = await articleModel.findMany(searchParams)
          return Response.json({
            success: true,
            data: result.data,
            pagination: {
              total: result.total,
              page: parseInt(searchParams.page) || 1,
              limit: parseInt(searchParams.limit) || 10,
            }
          })
        }

      case "POST":
        const createData = await request.json()
        const newArticle = await articleModel.create(createData)
        return Response.json({ success: true, data: newArticle }, { status: 201 })

      case "PUT":
        if (!id) {
          return new Response("Article ID required", { status: 400 })
        }
        const updateData = await request.json()
        const updatedArticle = await articleModel.update(id, updateData)
        return Response.json({ success: true, data: updatedArticle })

      case "DELETE":
        if (!id) {
          return new Response("Article ID required", { status: 400 })
        }
        const deleteResult = await articleModel.delete(id)
        return Response.json({ success: true, data: deleteResult })

      default:
        return new Response("Method not allowed", { status: 405 })
    }
  } catch (error) {
    console.error("Articles API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}