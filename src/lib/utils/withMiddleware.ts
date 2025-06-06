import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimits } from './rateLimit';
import { withLogging } from './withLogging';
import { handleError } from './apiErrors';

type RouteHandler = (
  req: NextRequest,
  context: any,
) => Promise<NextResponse> | NextResponse;

type Middleware = (handler: RouteHandler) => RouteHandler;

export const withMiddleware = (
  handler: RouteHandler,
  options: {
    rateLimit?: 'default' | 'admin' | false;
    logging?: boolean;
  } = {},
): RouteHandler => {
  let enhancedHandler = handler;

  // Apply rate limiting if enabled
  if (options.rateLimit !== false) {
    const config =
      options.rateLimit === 'admin' ? rateLimits.admin : rateLimits.default;

    const rateLimitMiddleware: Middleware = (handler) => {
      return async (req, context) => {
        const rateLimitResponse = await rateLimit(config)(req);
        if (rateLimitResponse) {return rateLimitResponse;}
        return handler(req, context);
      };
    };

    enhancedHandler = rateLimitMiddleware(enhancedHandler);
  }

  // Apply logging if enabled (default: true)
  if (options.logging !== false) {
    enhancedHandler = withLogging(enhancedHandler);
  }

  // Always apply error handling
  const withErrorHandling: Middleware = (handler) => {
    return async (req, context) => {
      try {
        return await handler(req, context);
      } catch (error) {
        return handleError(error);
      }
    };
  };

  enhancedHandler = withErrorHandling(enhancedHandler);

  return enhancedHandler;
};

// Helper to create route handlers with default middleware
export const createHandler = (
  handler: RouteHandler,
  options?: Parameters<typeof withMiddleware>[1],
) => {
  return withMiddleware(handler, options);
};

// Helper to create admin route handlers
export const createAdminHandler = (
  handler: RouteHandler,
  options?: Omit<Parameters<typeof withMiddleware>[1], 'rateLimit'>,
) => {
  return withMiddleware(handler, { ...options, rateLimit: 'admin' });
};
