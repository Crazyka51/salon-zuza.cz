import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth-utils';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { del } from '@vercel/blob';

/**
 * API endpoint pro smazání média
 * 
 * DELETE /api/admin/media/delete?path=/media/2023/01/file.jpg
 */
export async function DELETE(request: NextRequest) {
  try {
    // Autentizace admina
    const admin = await authenticateAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Získání parametrů dotazu
    const { searchParams } = new URL(request.url);
    const mediaPath = searchParams.get('path');
    
    if (!mediaPath) {
      return NextResponse.json({ success: false, error: 'No file path provided' }, { status: 400 });
    }
    
    // Odstranění počátečního lomítka (pokud existuje)
    const cleanPath = mediaPath.startsWith('/') ? mediaPath.substring(1) : mediaPath;
    
    // PRODUKCE: Použít Vercel Blob Storage
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_BLOB_API) {
      // Pro Blob Storage očekáváme URL, ne lokální cestu
      try {
        await del(mediaPath, { token: process.env.VERCEL_BLOB_API });
        return NextResponse.json({ 
          success: true, 
          message: 'File deleted successfully',
          path: mediaPath
        });
      } catch (error) {
        console.error('Blob storage delete error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Selhalo smazání z blob storage'
        return NextResponse.json(
          { success: false, error: errorMessage }, 
          { status: 500 }
        )
      }
    }

    // DEVELOPMENT: Lokální filesystem
    // Kontrola, zda cesta obsahuje pouze povolené složky (média)
    if (!cleanPath.startsWith('media/')) {
      return NextResponse.json({ success: false, error: 'Invalid file path' }, { status: 400 });
    }
    
    // Převod na absolutní cestu
    const filePath = path.join(process.cwd(), 'public', cleanPath);
    
    // Kontrola existence souboru
    if (!existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }
    
    // Smazání souboru
    await unlink(filePath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully',
      path: mediaPath
    });
    
  } catch (error) {
    console.error('Media delete error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba serveru'
    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    )
  }
}
