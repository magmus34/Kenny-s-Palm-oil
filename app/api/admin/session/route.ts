import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdminAuthenticated } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const isAuthenticated = isRequestAdminAuthenticated(req);
  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
