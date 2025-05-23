import { NextRequest, NextResponse } from "next/server";
import { createError } from "./apiErrors";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.store = new Map();
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + windowMs };
      this.store.set(key, newRecord);
      return newRecord;
    }

    record.count++;
    return record;
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const store = new RateLimitStore();

// Clean up expired records periodically
setInterval(() => store.cleanup(), 60000); // Every minute

export const rateLimit = (config: RateLimitConfig) => {
  return async (req: NextRequest): Promise<NextResponse | undefined> => {
    const key = generateKey(req);
    const { count, resetTime } = await store.increment(key, config.windowMs);

    // Set rate limit headers
    const headers = new Headers({
      "X-RateLimit-Limit": config.max.toString(),
      "X-RateLimit-Remaining": Math.max(0, config.max - count).toString(),
      "X-RateLimit-Reset": resetTime.toString(),
    });

    if (count > config.max) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      headers.set("Retry-After", retryAfter.toString());

      const error = createError.rateLimit("Too many requests", {
        retryAfter,
        limit: config.max,
        windowMs: config.windowMs,
      });
      const response = error.toResponse();

      // Copy headers to error response
      headers.forEach((value, key) => response.headers.set(key, value));
      return response;
    }

    return undefined; // Continue to next middleware/handler
  };
};

// Rate limit configurations
export const rateLimits = {
  default: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 500, // 500 requests per minute
  },
};

// Generate a unique key for rate limiting
function generateKey(req: NextRequest): string {
  // Use IP address as base key
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";

  // Add route to make it specific to endpoints
  const route = new URL(req.url).pathname;

  return `${ip}:${route}`;
}
