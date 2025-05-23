import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, rateLimits } from "./lib/utils/rateLimit";

// Extend the NextAuth middleware
export default withAuth(
  async function middleware(request: NextRequest) {
    const isAdminRoute = request.nextUrl.pathname.startsWith("/api/admin");

    // Check rate limit
    const config = isAdminRoute ? rateLimits.admin : rateLimits.default;
    const rateLimitResponse = await rateLimit(config)(request);
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
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("MIDDLEWARE:", req.nextUrl.pathname, "TOKEN:", token);
        const isAdminRoute = req.nextUrl.pathname.startsWith("/api/admin");
        if (isAdminRoute) {
          return token?.role === "admin";
        }
        return !!token;
      },
    },
  },
);

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
