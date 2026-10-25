import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/**
 * GET /api/images/[id]
 * Public route to serve uploaded media reliably, either from disk or Firestore backup.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('Image ID required', { status: 400 });
    }

    // 1. Check exact match or scan uploads directory for matching filename/ID
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const directFilePath = path.join(uploadsDir, id);
      if (fs.existsSync(directFilePath)) {
        const fileBuffer = await fs.promises.readFile(directFilePath);
        const ext = path.extname(id).toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.gif') contentType = 'image/gif';

        return new Response(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }

      // Check if any file in uploads directory contains or starts with the requested id
      const files = await fs.promises.readdir(uploadsDir);
      const matched = files.find((f) => f.includes(id) || id.includes(f.split('.')[0]));
      if (matched) {
        const matchedPath = path.join(uploadsDir, matched);
        const buffer = await fs.promises.readFile(matchedPath);
        const ext = path.extname(matched).toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.gif') contentType = 'image/gif';

        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 2. Look up Firestore media document fallback
    try {
      const cleanDocId = id.replace(/\.[a-zA-Z0-9]+$/, '');
      const mediaDocRef = doc(db, 'media', cleanDocId);
      const mediaDocSnap = await getDoc(mediaDocRef);

      if (mediaDocSnap.exists()) {
        const data = mediaDocSnap.data();
        const mimeType = data.mimeType || 'image/jpeg';

        if (data.dataBase64) {
          const buffer = Buffer.from(data.dataBase64, 'base64');
          return new Response(new Uint8Array(buffer), {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Firestore image lookup note:', dbErr);
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (error: any) {
    console.error('Error serving image:', error);
    return new NextResponse(`Error loading image: ${error?.message || String(error)}`, { status: 500 });
  }
}
