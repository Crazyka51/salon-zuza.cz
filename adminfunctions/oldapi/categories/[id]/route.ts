import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { categoryService } from "@/lib/category-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// GET - Získat jednu kategorii podle ID
export const GET = requireAuth(
  async (request: NextRequest, authResult: any, context: any) => {
    try {
      const { id } = await context.params;
      const category = await categoryService.getCategoryById(id);


      if (!category) {

        return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 });
      }

      return NextResponse.json(category);
    } catch (error) {
      return NextResponse.json(
        {
          message: "Chyba při načítání kategorie",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  ["admin", "editor"]
);

// PUT - Aktualizovat kategorii
export const PUT = requireAuth(
  async (request: NextRequest, authResult: any, context: any) => {
    try {
      const { id } = await context.params;
      const updateData = await request.json();
      // Mapování už není potřeba, názvy polí jsou nyní konzistentní

      const updatedCategory = await categoryService.updateCategory(id, updateData);


      if (!updatedCategory) {

        return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Kategorie byla aktualizována",
        category: updatedCategory,
      });
    } catch (error) {
      return NextResponse.json(
        {
          message: error instanceof Error ? error.message : "Chyba při aktualizaci kategorie",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  ["admin"]
);

// DELETE - Smazat kategorii
export const DELETE = requireAuth(
  async (request: NextRequest, authResult: any, context: any) => {
    try {
      const { id } = await context.params;

      // Kontrola, zda je kategorie přiřazena k nějakým článkům
      const articleCount = await prisma.article.count({
        where: {
          categoryId: id,
        },
      });

      if (articleCount > 0) {
        return NextResponse.json(
          {
            message: `Kategorii nelze smazat, je přiřazena k ${articleCount} článkům.`,
          },
          { status: 409 }
        );
      }

      const deleted = await categoryService.deleteCategory(id);


      if (!deleted) {

        return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Kategorie byla úspěšně smazána",
      });
    } catch (error) {
      return NextResponse.json(
        {
          message: error instanceof Error ? error.message : "Chyba při mazání kategorie",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
  ["admin"]
);
