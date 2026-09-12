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

// GET /api/admin/articles/[id] - Get a single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: true,
        category: true,
      },
    });
    
    if (!article) {
      return NextResponse.json({ success: false, error: 'Článek nenalezen' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při načítání článku';
    const status = errorMessage === 'Neplatný token' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }

}

// PUT /api/admin/articles/[id] - Update an article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    const articleData = await request.json();

    // If title is being updated, regenerate the slug
    let slug;
    if (articleData.title) {
      slug =
        (articleData.slug ||
        articleData.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')) +
        '-' +
        Date.now().toString().slice(-6);
    }

    const updatedArticle = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...articleData,
        slug: slug, // slug is updated only if title is present
        publishedAt: articleData.status === 'PUBLISHED' ? new Date() : (articleData.status === 'DRAFT' ? null : undefined), // Handle publishedAt based on status
      },
    });
    
    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při aktualizaci článku';
    const status = errorMessage === 'Neplatný token' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }

}

// DELETE /api/admin/articles/[id] - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request);
    await prisma.article.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true, message: 'Článek byl smazán' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při mazání článku';
    const status = errorMessage === 'Neplatný token' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }

}
