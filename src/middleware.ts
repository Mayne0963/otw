import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, rateLimits } from "./lib/utils/rateLimit";

export default async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/api/admin");
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
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Check Firebase auth token for protected routes
  if (isProtectedRoute) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      // Redirect to sign in page for protected routes
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // For API routes, verify the Firebase token
    if (request.nextUrl.pathname.startsWith('/api/')) {
      try {
        // Import Firebase Admin SDK for token verification
        const { getAuth } = await import('firebase-admin/auth');
        const { initializeApp, getApps, cert } = await import('firebase-admin/app');
        
        // Initialize Firebase Admin if not already initialized
        if (!getApps().length) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
          initializeApp({
            credential: cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
          });
        }
        
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // Check admin role for admin routes
        if (isAdminRoute && decodedToken.role !== 'admin') {
          return new NextResponse('Forbidden', { status: 403 });
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  return response;
}

// Configure which routes use this middleware
// Single config definition at the bottom of the file
export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/user-profile/:path*",
    "/api/verify-id/:path*",
    "/api/create-checkout-session/:path*",
    "/api/redeem-spin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};
