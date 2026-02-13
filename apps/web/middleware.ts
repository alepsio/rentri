import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/fleet', '/routes', '/airports', '/finance', '/leaderboard', '/admin', '/onboarding'];

export function middleware(req: NextRequest) {
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    const hasRefresh = req.cookies.get('refresh_token');
    if (!hasRefresh) return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/fleet/:path*', '/routes/:path*', '/airports/:path*', '/finance/:path*', '/leaderboard/:path*', '/admin/:path*', '/onboarding/:path*'],
};
