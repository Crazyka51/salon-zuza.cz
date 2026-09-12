import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to verify authentication
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Neplatný token');
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('Chyba konfigurace serveru');
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Neplatný token');
  }
}

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Auth might not be needed for public reading of categories
    // verifyAuth(request) 
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při načítání kategorií';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request);
    const categoryData = await request.json();

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { message: 'Název kategorie je povinný' },
        { status: 400 }
      );
    }

    // Generovat slug, pokud nebyl zadán
    let slug = categoryData.slug;
    if (!slug && categoryData.name) {
      slug = categoryData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Odstranění diakritiky
        .replace(/[^a-z0-9\s-]/g, "") // Odstranění speciálních znaků
        .replace(/\s+/g, "-") // Nahrazení mezer pomlčkami
        .replace(/-+/g, "-") // Nahrazení vícenásobných pomlček jednou
        .trim();
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: slug,
        description: categoryData.description,
        color: categoryData.color || '#3B82F6',
        display_order: categoryData.display_order || 0,
        is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
        parent_id: categoryData.parent_id || null,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při vytváření kategorie';
    const status = errorMessage === 'Neplatný token' ? 401 : 500;
    return NextResponse.json({ message: errorMessage }, { status });
  }
}
