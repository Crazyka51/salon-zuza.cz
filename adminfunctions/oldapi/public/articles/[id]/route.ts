export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from "next/server";
import { getArticleById } from "@/lib/services/article-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Získání článku podle ID pomocí existující služby
    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json({ error: "Článek nenalezen" }, { status: 404 });
    }

    if (article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Článek není publikován" }, { status: 403 });
    }

    // Mapování dat na formát očekávaný na frontend
    const articleData = {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author?.name || "Pavel Fišer",
      publishedAt: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      category: article.category?.name || "Aktuality",
      tags: article.tags || [],
      imageUrl: article.imageUrl,
      slug: article.slug
    };

    return NextResponse.json(articleData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Nepodařilo se načíst článek" },
      { status: 500 }
    );
  }
}
