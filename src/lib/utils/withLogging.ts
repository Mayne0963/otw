import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";
// import { auth } from "../firebaseAdmin";

type RouteHandler = (
  req: NextRequest,
  context: any,
) => Promise<NextResponse> | NextResponse;

export function withLogging(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: any) => {
    const start = Date.now();
    let userId: string | undefined;
    let response: NextResponse | undefined;
    let error: Error | undefined;

    try {
      // Extract user ID from auth token if present
      // Temporarily disabled during Firebase setup
      // const authHeader = req.headers.get("authorization");
      // if (authHeader?.startsWith("Bearer ")) {
      //   const tokenParts = authHeader.split(" ");
      //   const idToken = tokenParts[1];
      //   if (idToken) {
      //     try {
      //       const decoded = await auth.verifyIdToken(idToken);
      //       userId = decoded.uid;
      //     } catch {
      //       // Ignore token verification errors here as they'll be handled by the route
      //     }
      //   }
      // }

      // Execute the route handler
      response = await handler(req, context);
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${req.url} - ${response.status} (${duration}ms)`,
      );
    } catch (e) {
      error = e as Error;
      const duration = Date.now() - start;
      console.error(`${req.method} ${req.url} - Error (${duration}ms):`, error);
      // Re-throw the error to be handled by the global error handler
      throw e;
    } finally {
      // Always log the request, even if it errors
      const res = response || new NextResponse(null, { status: 500 });
      await logger.logRequest(req, res, userId, start, error);
    }

    return response;
  };
}
