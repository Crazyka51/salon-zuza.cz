import { type NextRequest, NextResponse } from "next/server";
import { requireAuth, authenticateAdmin } from "@/lib/auth-utils";
import { articleService } from "@/lib/article-service";

export const PUT = requireAuth(async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
  try {
    if (authResult.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Nedostatečná oprávnění",
        },
        { status: 403 },
      );
    }

    const articleData = await request.json();
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const articleId = resolvedParams.id;

    const updatedArticle = await articleService.updateArticle(articleId, articleData);

    if (!updatedArticle) {
      return NextResponse.json(
        {
          success: false,
          error: "Článek nebyl nalezen",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně aktualizován",
      data: updatedArticle,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při aktualizaci článku",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

export const GET = requireAuth(
  async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
  try {
    // Kontrola role
    if (authResult.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Nedostatečná oprávnění",
        },
        { status: 403 },
      );
    }

    // Nejprve počkáme na params
    const resolvedParams = await params;
    if (!resolvedParams.id) {
      throw new Error("ID článku není specifikováno");
    }

    const article = await articleService.getArticleById(resolvedParams.id);
    if (!article) {
      return NextResponse.json({ 
        success: false, 
        error: "Článek nebyl nalezen" 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("Chyba při načítání článku:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Chyba při načítání článku",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
  try {
    
    if (authResult.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    
    // Nejprve počkáme na params
    const resolvedParams = await params;
    
    const success = await articleService.deleteArticle(resolvedParams.id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete article", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
});
