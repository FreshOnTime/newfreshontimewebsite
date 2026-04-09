import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the auth token from cookies (set by our auth service)
    const authToken = request.cookies.get('accessToken')?.value;
    
    // If no token, redirect to login with redirect parameter
    if (!authToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If token exists, let the request continue
    // The admin layout will handle role-based access control
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run middleware only where auth guarding is needed
    '/admin/:path*',
  ],
};
