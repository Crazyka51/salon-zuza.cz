import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma-client';

// Definice enum hodnot pro validaci
const ContentBlockType = {
  TEXT: 'TEXT',
  HTML: 'HTML',
  MARKDOWN: 'MARKDOWN'
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    console.log('Loading content blocks for section:', section || 'all');
    
    let contentBlocks;
    
    if (section) {
      contentBlocks = await prisma.contentBlock.findMany({
        where: {
          section: section
        },
        orderBy: {
          orderIndex: 'asc'
        }
      });
    } else {
      contentBlocks = await prisma.contentBlock.findMany({
        orderBy: [
          { section: 'asc' },
          { orderIndex: 'asc' }
        ]
      });
    }

    const formattedBlocks = contentBlocks.map(block => ({
      ...block,
      content: block.content || '',
      type: block.type || 'TEXT'
    }));

    console.log('Returning content blocks:', formattedBlocks);

    return NextResponse.json({
      success: true,
      data: formattedBlocks,
      message: `Found ${formattedBlocks.length} content blocks`
    });
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content blocks' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    const body = await request.json();
    const { id, content, type } = body;

    if (!id || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: id, content, type' },
        { status: 400 }
      );
    }

    // Validace typu obsahu
    if (!Object.values(ContentBlockType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Aktualizace content blocku
    const updatedBlock = await prisma.contentBlock.update({
      where: { id },
      data: {
        content,
        type,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedBlock,
      message: 'Content block updated successfully'
    });
  } catch (error) {
    console.error('Error updating content block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content block' },
      { status: 500 }
    );
  }
}, ['admin']);

export const POST = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    const body = await request.json();
    const { key, content, type, section, label, orderIndex } = body;

    if (!key || !content || !type || !section || !label) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: key, content, type, section, label' },
        { status: 400 }
      );
    }

    // Validace typu obsahu
    if (!Object.values(ContentBlockType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Kontrola duplicitního klíče
    const existingBlock = await prisma.contentBlock.findUnique({
      where: { key }
    });

    if (existingBlock) {
      return NextResponse.json(
        { success: false, error: 'Content block with this key already exists' },
        { status: 409 }
      );
    }

    // Vytvoření nového content blocku
    const newBlock = await prisma.contentBlock.create({
      data: {
        key,
        content,
        type,
        section,
        label,
        orderIndex: orderIndex || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: newBlock,
      message: 'Content block created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating content block:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create content block' },
      { status: 500 }
    );
  }
}, ['admin']);