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
    // We expect the JWT payload to contain the user's ID
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Neplatný token');
  }
}

// GET /api/admin/articles - Get all articles
export async function GET(request: NextRequest) {
  try {
    verifyAuth(request);
    const articles = await prisma.article.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        author: true,
        category: true,
      },
    });
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při načítání článků';
    const status = errorMessage === 'Neplatný token' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}


// POST /api/admin/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const userData = verifyAuth(request) as { id: string };
    const articleData = await request.json();

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Název, obsah a ID kategorie jsou povinné' },
        { status: 400 }
      );
    }

    // Create a unique slug from the title
    const slug =
      (articleData.slug ||
      articleData.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')) +
      '-' +
      Date.now().toString().slice(-6);

    const newArticle = await prisma.article.create({
      data: {
        title: articleData.title,
        slug: slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        imageUrl: articleData.imageUrl,
        status: articleData.status || 'DRAFT',
        isFeatured: articleData.isFeatured || false,
        authorId: userData.id,
        categoryId: articleData.categoryId,
        tags: articleData.tags || [],
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        publishedAt: articleData.status === 'PUBLISHED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: newArticle }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při vytváření článku';
    const status = errorMessage === 'Neplatný token' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}
