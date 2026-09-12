import { type NextRequest, NextResponse } from "next/server";
import { requireAuth, authenticateAdmin } from "@/lib/auth-utils";
import { categoryService } from "@/lib/category-service";

export const GET = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeArticleCount = searchParams.get("includeArticleCount") === "true";
    const categories = await categoryService.getCategories({ includeArticleCount });
    const total = await categoryService.getTotalCategoryCount({});

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při načítání kategorií",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, authResult: any) => {
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

    const categoryData = await request.json();

    if (!categoryData.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Název je povinný",
        },
        { status: 400 },
      );
    }

    const newCategory = await categoryService.createCategory(categoryData);

    return NextResponse.json(
      {
        success: true,
        message: "Kategorie byla úspěšně vytvořena",
        data: newCategory,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při vytváření kategorie",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
