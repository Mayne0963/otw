import { GeocodeResult, ReverseGeocodeResult, AddressValidationResult } from '../services/geocoding-service';

/**
 * Frontend utility functions for geocoding operations
 */

/**
 * API endpoints for geocoding operations
 */
export const GEOCODING_ENDPOINTS = {
  GEOCODE: '/api/maps?action=geocode',
  REVERSE_GEOCODE: '/api/maps?action=reverse-geocode',
  VALIDATE: '/api/maps?action=validate',
  BATCH_GEOCODE: '/api/maps?action=batch-geocode',
  HEALTH: '/api/maps?action=health',
  STATS: '/api/maps?action=stats',
  CLEAR_CACHE: '/api/maps?action=clear-cache',
} as const;

/**
 * Error types for geocoding operations
 */
export enum GeocodingErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Geocoding error class
 */
export class GeocodingError extends Error {
  constructor(
    public type: GeocodingErrorType,
    message: string,
    public statusCode?: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'GeocodingError';
  }
}

/**
 * Options for geocoding requests
 */
export interface GeocodingRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Geocode an address using the backend service
 */
export async function geocodeAddress(
  address: string,
  options: GeocodingRequestOptions = {},
): Promise<GeocodeResult | null> {
  const { timeout = 10000, retries = 3, retryDelay = 1000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(GEOCODING_ENDPOINTS.GEOCODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          throw new GeocodingError(
            GeocodingErrorType.RATE_LIMIT_ERROR,
            'Rate limit exceeded',
            response.status,
            retryAfter,
          );
        }

        throw new GeocodingError(
          GeocodingErrorType.API_ERROR,
          errorData.error || `HTTP ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();
      return data.result || null;

    } catch (error) {
      if (error instanceof GeocodingError) {
        if (error.type === GeocodingErrorType.RATE_LIMIT_ERROR && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, (error.retryAfter || 60) * 1000));
          continue;
        }
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GeocodingError(
          GeocodingErrorType.NETWORK_ERROR,
          'Request timeout',
        );
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }

      throw new GeocodingError(
        GeocodingErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  throw new GeocodingError(
    GeocodingErrorType.UNKNOWN_ERROR,
    'Max retries exceeded',
  );
}

/**
 * Reverse geocode coordinates using the backend service
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  options: GeocodingRequestOptions = {},
): Promise<ReverseGeocodeResult | null> {
  const { timeout = 10000, retries = 3, retryDelay = 1000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(GEOCODING_ENDPOINTS.REVERSE_GEOCODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          throw new GeocodingError(
            GeocodingErrorType.RATE_LIMIT_ERROR,
            'Rate limit exceeded',
            response.status,
            retryAfter,
          );
        }

        throw new GeocodingError(
          GeocodingErrorType.API_ERROR,
          errorData.error || `HTTP ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();
      return data.result || null;

    } catch (error) {
      if (error instanceof GeocodingError) {
        if (error.type === GeocodingErrorType.RATE_LIMIT_ERROR && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, (error.retryAfter || 60) * 1000));
          continue;
        }
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GeocodingError(
          GeocodingErrorType.NETWORK_ERROR,
          'Request timeout',
        );
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }

      throw new GeocodingError(
        GeocodingErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  throw new GeocodingError(
    GeocodingErrorType.UNKNOWN_ERROR,
    'Max retries exceeded',
  );
}

/**
 * Validate an address using the backend service
 */
export async function validateAddress(
  address: string,
  options: GeocodingRequestOptions = {},
): Promise<AddressValidationResult> {
  const { timeout = 10000, retries = 3, retryDelay = 1000 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(GEOCODING_ENDPOINTS.VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          throw new GeocodingError(
            GeocodingErrorType.RATE_LIMIT_ERROR,
            'Rate limit exceeded',
            response.status,
            retryAfter,
          );
        }

        throw new GeocodingError(
          GeocodingErrorType.API_ERROR,
          errorData.error || `HTTP ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();
      return data.result;

    } catch (error) {
      if (error instanceof GeocodingError) {
        if (error.type === GeocodingErrorType.RATE_LIMIT_ERROR && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, (error.retryAfter || 60) * 1000));
          continue;
        }
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new GeocodingError(
          GeocodingErrorType.NETWORK_ERROR,
          'Request timeout',
        );
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }

      throw new GeocodingError(
        GeocodingErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  throw new GeocodingError(
    GeocodingErrorType.UNKNOWN_ERROR,
    'Max retries exceeded',
  );
}

/**
 * Get geocoding service health status
 */
export async function getGeocodingHealth(): Promise<any> {
  try {
    const response = await fetch(GEOCODING_ENDPOINTS.HEALTH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new GeocodingError(
      GeocodingErrorType.API_ERROR,
      error instanceof Error ? error.message : 'Failed to get health status',
    );
  }
}

/**
 * Get geocoding service statistics
 */
export async function getGeocodingStats(): Promise<any> {
  try {
    const response = await fetch(GEOCODING_ENDPOINTS.STATS);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new GeocodingError(
      GeocodingErrorType.API_ERROR,
      error instanceof Error ? error.message : 'Failed to get statistics',
    );
  }
}

/**
 * Clear geocoding cache
 */
export async function clearGeocodingCache(): Promise<void> {
  try {
    const response = await fetch(GEOCODING_ENDPOINTS.CLEAR_CACHE, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    throw new GeocodingError(
      GeocodingErrorType.API_ERROR,
      error instanceof Error ? error.message : 'Failed to clear cache',
    );
  }
}

/**
 * Format geocoding result for display
 */
export function formatGeocodeResult(result: GeocodeResult): string {
  return result.formatted_address;
}

/**
 * Extract address components from geocoding result
 */
export function extractAddressComponents(result: GeocodeResult) {
  const components: Record<string, string> = {};

  result.address_components.forEach(component => {
    component.types.forEach(type => {
      components[type] = component.long_name;
    });
  });

  return {
    streetNumber: components.street_number || '',
    route: components.route || '',
    locality: components.locality || '',
    administrativeAreaLevel1: components.administrative_area_level_1 || '',
    administrativeAreaLevel2: components.administrative_area_level_2 || '',
    country: components.country || '',
    postalCode: components.postal_code || '',
    formattedAddress: result.formatted_address,
  };
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Debounce function for address input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for geocoding requests
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}