import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimits } from './lib/utils/rateLimit';

export default async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
  const isProtectedRoute = config.matcher.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'));
    return regex.test(request.nextUrl.pathname);
  });

  // Check rate limit
  const rateLimitConfig = isAdminRoute ? rateLimits.admin : rateLimits.default;
  const rateLimitResponse = await rateLimit(rateLimitConfig)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Check auth token for protected routes
  if (isProtectedRoute) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      // Redirect to sign in page for protected routes
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // For API routes, basic token presence check
    // Note: Full Firebase token verification should be done in API route handlers
    // since Firebase Admin SDK is not compatible with Edge Runtime
    if (request.nextUrl.pathname.startsWith('/api/')) {
      // Basic token format validation
      if (!token || token.length < 10) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Admin routes require additional validation in the API handler itself
      // This middleware only does basic checks
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );

  return response;
}

// Configure which routes use this middleware
// Single config definition at the bottom of the file
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/user-profile/:path*',
    '/api/verify-id/:path*',
    '/api/create-checkout-session/:path*',
    '/api/redeem-spin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/orders/:path*',
    '/checkout/:path*',
  ],
};
