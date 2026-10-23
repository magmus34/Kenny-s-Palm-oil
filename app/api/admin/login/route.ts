import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  createSessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incorrect administrator password. Please check and try again.',
        },
        { status: 401 }
      );
    }

    // Password matched. Issue secure session token.
    const { token, expiresAt } = createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Admin authorization successful',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
