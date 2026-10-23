import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdminAuthenticated } from '@/lib/server-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { BannerSettings } from '@/types';

/**
 * POST /api/admin/banner
 * Protected: Updates homepage banner configuration
 */
export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const settings: Partial<BannerSettings> = await req.json();

    if (!settings.heading || typeof settings.heading !== 'string') {
      return NextResponse.json(
        { error: 'Banner heading is required' },
        { status: 400 }
      );
    }

    const payload: Record<string, any> = {
      heading: settings.heading.trim(),
      subtitle: settings.subtitle?.trim() || '',
      badge: settings.badge?.trim() || '',
      imageUrl: settings.imageUrl?.trim() || '',
      buttonText: settings.buttonText?.trim() || 'Shop All Sizes',
      buttonLink: settings.buttonLink?.trim() || '#catalog',
      showBanner: settings.showBanner !== undefined ? Boolean(settings.showBanner) : true,
      showButton: settings.showButton !== undefined ? Boolean(settings.showButton) : true,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'settings', 'banner'), payload, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Banner settings updated successfully',
      settings: payload,
    });
  } catch (error: any) {
    console.error('API /api/admin/banner error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update banner settings' },
      { status: 500 }
    );
  }
}
