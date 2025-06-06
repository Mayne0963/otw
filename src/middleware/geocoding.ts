import { NextRequest, NextResponse } from 'next/server';
import { geocodingService } from '@/lib/services/geocoding-service';

// Geocoding middleware for request preprocessing and validation
export async function geocodingMiddleware(request: NextRequest) {
  // Skip middleware for non-geocoding requests
  if (!request.nextUrl.pathname.startsWith('/api/maps')) {
    return NextResponse.next();
  }

  // Add CORS headers for geocoding API
  const response = NextResponse.next();

  // Allow requests from your domain in production
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-domain.com', // Replace with your actual domain
  ];

  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  // Add rate limiting headers
  try {
    const stats = geocodingService.getStats();
    response.headers.set('X-RateLimit-Limit', stats.rateLimitPerMinute.toString());
    response.headers.set('X-RateLimit-Remaining', stats.remainingRequests.toString());
    response.headers.set('X-Cache-Size', stats.cacheSize.toString());
  } catch (error) {
    // Silently fail if service is not available
    console.warn('Failed to get geocoding service stats:', error);
  }

  return response;
}

// Request validation utilities
export function validateGeocodingRequest(searchParams: URLSearchParams, requiredParams: string[]) {
  const missing = requiredParams.filter(param => !searchParams.get(param));

  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Missing required parameters: ${missing.join(', ')}`,
      status: 400,
    };
  }

  return { isValid: true };
}

export function validateCoordinates(lat: string | null, lng: string | null) {
  if (!lat || !lng) {
    return {
      isValid: false,
      error: 'Latitude and longitude are required',
      status: 400,
    };
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      isValid: false,
      error: 'Invalid latitude or longitude format',
      status: 400,
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      isValid: false,
      error: 'Latitude must be between -90 and 90',
      status: 400,
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      error: 'Longitude must be between -180 and 180',
      status: 400,
    };
  }

  return {
    isValid: true,
    coordinates: { lat: latitude, lng: longitude },
  };
}

export function validateAddress(address: string | null) {
  if (!address) {
    return {
      isValid: false,
      error: 'Address is required',
      status: 400,
    };
  }

  if (address.trim().length < 3) {
    return {
      isValid: false,
      error: 'Address must be at least 3 characters long',
      status: 400,
    };
  }

  if (address.length > 500) {
    return {
      isValid: false,
      error: 'Address must be less than 500 characters',
      status: 400,
    };
  }

  return { isValid: true, address: address.trim() };
}

// Response formatting utilities
export function formatSuccessResponse(data: any, metadata?: any) {
  const response: any = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (metadata) {
    response.metadata = metadata;
  }

  return response;
}

export function formatErrorResponse(error: string, details?: any, status = 500) {
  return {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
    status,
  };
}

// Logging utilities for geocoding operations
export function logGeocodingOperation(
  operation: string,
  input: any,
  result: any,
  duration: number,
  success: boolean,
) {
  const logData = {
    operation,
    input: typeof input === 'string' ? input : JSON.stringify(input),
    success,
    duration,
    timestamp: new Date().toISOString(),
    resultType: success ? typeof result : 'error',
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Geocoding Operation:', logData);
  }

  // In production, you might want to send this to a logging service
  // like DataDog, LogRocket, or your own analytics endpoint
}

// Health check utilities
export async function performHealthCheck() {
  try {
    const health = await geocodingService.healthCheck();
    const stats = geocodingService.getStats();

    return {
      status: health.status,
      timestamp: new Date().toISOString(),
      service: {
        apiKeyConfigured: health.apiKeyConfigured,
        cacheEnabled: health.cacheEnabled,
        rateLimitRemaining: health.rateLimitRemaining,
        cacheSize: stats.cacheSize,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.GOOGLE_MAPS_API_KEY,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!process.env.GOOGLE_MAPS_API_KEY,
      },
    };
  }
}

// Configuration validation
export function validateGeocodingConfig() {
  const issues: string[] = [];

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    issues.push('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  if (process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY.length < 30) {
    issues.push('GOOGLE_MAPS_API_KEY appears to be invalid (too short)');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

// Export middleware configuration
export const config = {
  matcher: '/api/maps/:path*',
};