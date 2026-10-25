import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdminAuthenticated } from '@/lib/server-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/**
 * POST /api/admin/upload
 * Protected endpoint: Uploads and permanently stores product or banner imagery.
 */
export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required to upload images' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image file provided in upload request' },
        { status: 400 }
      );
    }

    // Validate mime type
    const mimeType = file.type || 'image/jpeg';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Allowed types: JPG, PNG, WebP.' },
        { status: 400 }
      );
    }

    // Limit to 10MB maximum
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 10MB limit.' },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';

    const safePrefix = folder === 'banners' ? 'banner' : 'product';
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filename = `${safePrefix}_${uniqueId}.${ext}`;

    // 1. Write to public/uploads directory for lightning-fast direct static serving
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    // 2. Persist metadata & base64 backup into Firestore media collection
    // (fits within Firestore document limit for compressed web assets)
    let mediaDocId = uniqueId;
    try {
      const isUnderDocLimit = buffer.length < 800 * 1024; // 800KB safe margin under 1MB Firestore doc limit
      const docRef = await addDoc(collection(db, 'media'), {
        filename,
        folder,
        mimeType,
        size: buffer.length,
        dataBase64: isUnderDocLimit ? buffer.toString('base64') : null,
        url: `/uploads/${filename}`,
        createdAt: new Date().toISOString(),
      });
      mediaDocId = docRef.id;
    } catch (dbErr) {
      console.warn('Media collection persistence note (file saved to disk):', dbErr);
    }

    const publicUrl = `/uploads/${filename}`;
    const fallbackUrl = `/api/images/${mediaDocId}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaUrl: fallbackUrl,
      id: mediaDocId,
      filename,
    });
  } catch (error: any) {
    console.error('Upload API processing error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process and store uploaded image.' },
      { status: 500 }
    );
  }
}
