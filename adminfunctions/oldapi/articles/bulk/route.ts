import { type NextRequest, NextResponse } from "next/server";
import { DataManager } from "@/lib/data-persistence";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  imageUrl?: string
  publishedAt?: string
}

interface BulkRequest {
  operation: "delete" | "publish" | "unpublish" | "category" | "tags" | "duplicate"
  items: string[]
  category?: string
  tags?: string[]
}

const articlesManager = new DataManager<Article>("articles");

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: BulkRequest = await request.json();
    const { operation, items, category, tags } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items selected" }, { status: 400 });
    }

    const articles = await articlesManager.read();
    const targetArticles = articles.filter((article: Article) => items.includes(article.id));

    if (targetArticles.length === 0) {
      return NextResponse.json({ error: "No matching articles found" }, { status: 404 });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const article of targetArticles) {
      try {
        switch (operation) {
          case "delete":
            await articlesManager.delete(article.id);
            successCount++;
            break;

          case "publish":
            await articlesManager.update(article.id, {
              ...article,
              published: true,
              publishedAt: undefined,
              updatedAt: new Date().toISOString(),
            });
            successCount++;
            break;

          case "unpublish":
            await articlesManager.update(article.id, {
              ...article,
              published: false,
              publishedAt: undefined,
              updatedAt: new Date().toISOString(),
            });
            successCount++;
            break;

          case "category":
            if (!category) {
              errors.push(`Kategorie není specifikována pro článek: ${article.title}`);
              failedCount++;
              continue;
            }
            await articlesManager.update(article.id, {
              ...article,
              category,
              updatedAt: new Date().toISOString(),
            });
            successCount++;
            break;

          case "tags":
            if (!tags) {
              errors.push(`Tagy nejsou specifikovány pro článek: ${article.title}`);
              failedCount++;
              continue;
            }
            await articlesManager.update(article.id, {
              ...article,
              tags,
              updatedAt: new Date().toISOString(),
            });
            successCount++;
            break;

          case "duplicate":
            const duplicatedArticle: Article = {
              ...article,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              title: `${article.title} (kopie)`,
              published: false,
              publishedAt: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await articlesManager.create(duplicatedArticle);
            successCount++;
            break;

          default:
            errors.push(`Neznámá operace: ${operation}`);
            failedCount++;
        }
      } catch (error) {
        failedCount++;
        errors.push(`Chyba u článku "${article.title}": ${error instanceof Error ? error.message : "Neznámá chyba"}`);
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors,
      message: `Zpracováno ${successCount} článků, ${failedCount} chyb`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
