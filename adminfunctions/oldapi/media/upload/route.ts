import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth-utils';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { put } from '@vercel/blob';

/**
 * API endpoint pro nahrávání souborů médií
 * 
 * POST /api/admin/media/upload
 */
export async function POST(request: NextRequest) {
  try {
    // Autentizace admina
    const admin = await authenticateAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Kontrola typu souboru (povolíme pouze obrázky)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not allowed' }, { status: 400 });
    }

    // Kontrola velikosti souboru (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Vytvoření hash pro název souboru
    const fileHash = crypto.randomBytes(8).toString('hex');
    
    // Získání přípony souboru
    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase();
    
    // Sanitizace názvu souboru
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${fileHash}-${safeName}`;
    
    // Převedení File na Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Použití Vercel Blob Storage pokud je nakonfigurován
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Použít Vercel Blob Storage
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const blobPath = `media/${currentYear}/${currentMonth}/${fileName}`;
      
      const blob = await put(blobPath, buffer, {
        access: 'blob',
      });
      
      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: fileName,
        originalName: originalName,
        fileSize: file.size,
        fileType: file.type
      });
    } else {
      // FALLBACK: Lokální filesystem (pouze pro development bez Blob Storage)
      const mediaDir = path.join(process.cwd(), 'public', 'media');
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const uploadDir = path.join(mediaDir, currentYear, currentMonth);
      
      if (!existsSync(mediaDir)) {
        mkdirSync(mediaDir, { recursive: true });
      }
      
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
      
      // Cesta k souboru
      const filePath = path.join(uploadDir, fileName);
      
      // Zápis souboru
      await writeFile(filePath, buffer);
      
      // Relativní cesta pro URL
      const relativePath = `/media/${currentYear}/${currentMonth}/${fileName}`;
      
      return NextResponse.json({
        success: true,
        url: relativePath,
        fileName: fileName,
        originalName: originalName,
        fileSize: file.size,
        fileType: file.type
      });
    }
    
  } catch (error) {
    console.error('Media upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba serveru'
    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    )
  }
}
