import { type NextRequest, NextResponse } from "next/server";
import { requireAuth, authenticateAdmin } from "@/lib/auth-utils";
import { articleService } from "@/lib/article-service";
import { db } from "@/lib/database";
import { adminUsers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ArticleStatus } from "@/types/cms"; // Změněn import z database.ts na cms.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET = requireAuth(async (request: NextRequest, authResult: any) => {
  // Logování pouze v development módu
  if (process.env.NODE_ENV === 'development') {
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const published = searchParams.get("published");
    const search = searchParams.get("search");

    const filters: any = {
      limit,
      offset: (page - 1) * limit,
    };

    if (category && category !== "all") {
      filters.category = category;
    }

    if (published !== null && published !== undefined) {
      filters.status = published === "true" ? "PUBLISHED" : "DRAFT";
    }

    if (search) {
      filters.search = search;
    }

    const articles = await articleService.getArticles(filters);
    const total = await articleService.getTotalArticleCount(filters); // Získání celkového počtu z DB

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při načítání článků",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    // Nyní máme autentizovaného uživatele v authResult
    if (authResult.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Nedostatečná oprávnění",
        },
        { status: 403 },
      );
    }

    if (process.env.NODE_ENV === 'development') {
    }

    const articleData = await request.json();

    // Validace povinných polí
    if (!articleData.title || !articleData.content || !articleData.categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Název, obsah a kategorie jsou povinné",
        },
        { status: 400 },
      );
    }

    // Použijeme ID přihlášeného uživatele jako autora
    const authorId = authResult.userId;

    // Ověření existence kategorie
    const category = await prisma.category.findUnique({
      where: { id: articleData.categoryId }
    });
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategorie nebyla nalezena",
        },
        { status: 404 },
      );
    }

    // Příprava dat pro vytvoření článku
    const newArticleData = {
      title: articleData.title,
      slug: articleData.slug || articleData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4),
      content: articleData.content,
      excerpt: articleData.excerpt || articleData.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      categoryId: articleData.categoryId,
      tags: articleData.tags || [],
      // Použijeme typ jako řetězec pro kompatibilitu s CreateArticleInput
      status: (articleData.status === ArticleStatus.PUBLISHED || articleData.published === true)
        ? ArticleStatus.PUBLISHED
        : ArticleStatus.DRAFT,
      imageUrl: articleData.imageUrl,
      publishedAt: articleData.publishedAt 
        ? new Date(articleData.publishedAt) 
        : (articleData.status === ArticleStatus.PUBLISHED || articleData.published ? new Date() : null),
      isFeatured: articleData.isFeatured || false,
      authorId: authorId,
      metaTitle: articleData.metaTitle,
      metaDescription: articleData.metaDescription,
    };


    const savedArticle = await articleService.createArticle(newArticleData);

    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně vytvořen",
      data: savedArticle,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při vytváření článku",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
