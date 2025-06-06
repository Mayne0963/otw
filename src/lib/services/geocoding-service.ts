import { Client } from '@googlemaps/google-maps-services-js';
import type { LatLngLiteral } from '@googlemaps/google-maps-services-js';
import { geocodeAddress, reverseGeocode, validateAddress } from '../maps';

// Enhanced interfaces for geocoding service
export interface GeocodingResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  place_id: string;
  types: string[];
  address_components: google.maps.GeocoderAddressComponent[];
  partial_match?: boolean;
}

export interface BatchGeocodingRequest {
  addresses: string[];
  options?: {
    validateDelivery?: boolean;
    includeTimezone?: boolean;
    language?: string;
    region?: string;
  };
}

export interface BatchGeocodingResult {
  results: Array<{
    address: string;
    success: boolean;
    result?: GeocodingResult;
    validation?: {
      isValid: boolean;
      isDeliverable: boolean;
      issues?: string[];
    };
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

export interface AddressValidationOptions {
  strictValidation?: boolean;
  checkDeliverability?: boolean;
  allowPOBoxes?: boolean;
  allowApproximateMatches?: boolean;
  requiredComponents?: string[]; // e.g., ['street_number', 'route', 'locality']
}

export interface GeocodingServiceOptions {
  apiKey?: string;
  enableCaching?: boolean;
  cacheTimeout?: number; // in milliseconds
  rateLimitPerMinute?: number;
  defaultLanguage?: string;
  defaultRegion?: string;
}

// Simple in-memory cache (in production, use Redis or similar)
interface CacheEntry {
  result: any;
  timestamp: number;
  ttl: number;
}

class GeocodingCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, {
      result: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Rate limiter for API calls
class RateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly windowMs = 60 * 1000; // 1 minute

  constructor(requestsPerMinute: number = 50) {
    this.limit = requestsPerMinute;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.limit) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.limit - this.requests.length);
  }
}

export class GeocodingService {
  private client: Client;
  private cache: GeocodingCache;
  private rateLimiter: RateLimiter;
  private options: Required<GeocodingServiceOptions>;

  constructor(options: GeocodingServiceOptions = {}) {
    this.options = {
      apiKey: options.apiKey || process.env.GOOGLE_MAPS_API_KEY || '',
      enableCaching: options.enableCaching ?? true,
      cacheTimeout: options.cacheTimeout || 24 * 60 * 60 * 1000, // 24 hours
      rateLimitPerMinute: options.rateLimitPerMinute || 50,
      defaultLanguage: options.defaultLanguage || 'en',
      defaultRegion: options.defaultRegion || 'US',
    };

    this.client = new Client({});
    this.cache = new GeocodingCache();
    this.rateLimiter = new RateLimiter(this.options.rateLimitPerMinute);

    if (!this.options.apiKey) {
      console.warn('Google Maps API key not provided to GeocodingService');
    }
  }

  /**
   * Enhanced geocoding with caching and rate limiting
   */
  async geocode(
    address: string,
    options: {
      language?: string;
      region?: string;
      bounds?: {
        northeast: LatLngLiteral;
        southwest: LatLngLiteral;
      };
      componentRestrictions?: {
        country?: string;
        postalCode?: string;
        locality?: string;
      };
    } = {},
  ): Promise<GeocodingResult | null> {
    if (!this.options.apiKey) {
      throw new Error('Google Maps API key is required for geocoding');
    }

    // Create cache key
    const cacheKey = `geocode:${address}:${JSON.stringify(options)}`;

    // Check cache first
    if (this.options.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check rate limit
    if (!(await this.rateLimiter.checkLimit())) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const params: any = {
        address,
        key: this.options.apiKey,
        language: options.language || this.options.defaultLanguage,
        region: options.region || this.options.defaultRegion,
      };

      if (options.bounds) {
        params.bounds = `${options.bounds.southwest.lat},${options.bounds.southwest.lng}|${options.bounds.northeast.lat},${options.bounds.northeast.lng}`;
      }

      if (options.componentRestrictions) {
        const components = [];
        if (options.componentRestrictions.country) {
          components.push(`country:${options.componentRestrictions.country}`);
        }
        if (options.componentRestrictions.postalCode) {
          components.push(`postal_code:${options.componentRestrictions.postalCode}`);
        }
        if (options.componentRestrictions.locality) {
          components.push(`locality:${options.componentRestrictions.locality}`);
        }
        if (components.length > 0) {
          params.components = components.join('|');
        }
      }

      const response = await this.client.geocode({ params });

      if (response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0];
      const geocodingResult: GeocodingResult = {
        formatted_address: result.formatted_address,
        geometry: {
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          location_type: result.geometry.location_type,
          viewport: result.geometry.viewport ? {
            northeast: {
              lat: result.geometry.viewport.northeast.lat,
              lng: result.geometry.viewport.northeast.lng,
            },
            southwest: {
              lat: result.geometry.viewport.southwest.lat,
              lng: result.geometry.viewport.southwest.lng,
            },
          } : undefined,
        },
        place_id: result.place_id,
        types: result.types,
        address_components: result.address_components,
        partial_match: result.partial_match,
      };

      // Cache the result
      if (this.options.enableCaching) {
        this.cache.set(cacheKey, geocodingResult, this.options.cacheTimeout);
      }

      return geocodingResult;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Failed to geocode address: ${address}`);
    }
  }

  /**
   * Enhanced reverse geocoding
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    options: {
      language?: string;
      resultTypes?: string[];
      locationTypes?: string[];
    } = {},
  ): Promise<GeocodingResult | null> {
    if (!this.options.apiKey) {
      throw new Error('Google Maps API key is required for reverse geocoding');
    }

    const cacheKey = `reverse:${lat}:${lng}:${JSON.stringify(options)}`;

    if (this.options.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    if (!(await this.rateLimiter.checkLimit())) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const params: any = {
        latlng: { lat, lng },
        key: this.options.apiKey,
        language: options.language || this.options.defaultLanguage,
      };

      if (options.resultTypes && options.resultTypes.length > 0) {
        params.result_type = options.resultTypes.join('|');
      }

      if (options.locationTypes && options.locationTypes.length > 0) {
        params.location_type = options.locationTypes.join('|');
      }

      const response = await this.client.reverseGeocode({ params });

      if (response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0];
      const geocodingResult: GeocodingResult = {
        formatted_address: result.formatted_address,
        geometry: {
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          location_type: result.geometry.location_type,
        },
        place_id: result.place_id,
        types: result.types,
        address_components: result.address_components,
      };

      if (this.options.enableCaching) {
        this.cache.set(cacheKey, geocodingResult, this.options.cacheTimeout);
      }

      return geocodingResult;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(`Failed to reverse geocode coordinates: ${lat}, ${lng}`);
    }
  }

  /**
   * Enhanced address validation
   */
  async validateAddress(
    address: string,
    options: AddressValidationOptions = {},
  ): Promise<{
    isValid: boolean;
    isDeliverable: boolean;
    geocodeResult?: GeocodingResult;
    issues?: string[];
    confidence?: 'high' | 'medium' | 'low';
  }> {
    try {
      const geocodeResult = await this.geocode(address);

      if (!geocodeResult) {
        return {
          isValid: false,
          isDeliverable: false,
          issues: ['Address not found'],
          confidence: 'low',
        };
      }

      const issues: string[] = [];
      let isDeliverable = true;
      let confidence: 'high' | 'medium' | 'low' = 'high';

      // Check for partial matches
      if (geocodeResult.partial_match) {
        issues.push('Address is a partial match - please verify');
        confidence = 'medium';
        if (options.strictValidation) {
          isDeliverable = false;
        }
      }

      // Check location type precision
      if (geocodeResult.geometry.location_type === 'APPROXIMATE') {
        issues.push('Address is approximate - please provide more specific details');
        confidence = 'low';
        if (!options.allowApproximateMatches) {
          isDeliverable = false;
        }
      }

      // Check required components
      if (options.requiredComponents && options.requiredComponents.length > 0) {
        const missingComponents = options.requiredComponents.filter(required =>
          !geocodeResult.address_components.some(component =>
            component.types.includes(required),
          ),
        );

        if (missingComponents.length > 0) {
          issues.push(`Missing required address components: ${missingComponents.join(', ')}`);
          isDeliverable = false;
        }
      }

      // Check for street number if deliverability is required
      if (options.checkDeliverability) {
        const hasStreetNumber = geocodeResult.address_components.some(
          component => component.types.includes('street_number'),
        );

        if (!hasStreetNumber) {
          issues.push('No street number found - please provide a complete address');
          isDeliverable = false;
        }
      }

      // Check for PO Box
      if (!options.allowPOBoxes && geocodeResult.formatted_address.toLowerCase().includes('po box')) {
        issues.push('PO Box addresses are not supported');
        isDeliverable = false;
      }

      return {
        isValid: true,
        isDeliverable,
        geocodeResult,
        issues: issues.length > 0 ? issues : undefined,
        confidence,
      };
    } catch (error) {
      console.error('Address validation error:', error);
      return {
        isValid: false,
        isDeliverable: false,
        issues: ['Failed to validate address'],
        confidence: 'low',
      };
    }
  }

  /**
   * Batch geocoding for multiple addresses
   */
  async batchGeocode(request: BatchGeocodingRequest): Promise<BatchGeocodingResult> {
    const startTime = Date.now();
    const results: BatchGeocodingResult['results'] = [];
    let successful = 0;
    let failed = 0;

    for (const address of request.addresses) {
      try {
        const geocodeResult = await this.geocode(address, {
          language: request.options?.language,
        });

        if (geocodeResult) {
          let validation;
          if (request.options?.validateDelivery) {
            validation = await this.validateAddress(address, {
              checkDeliverability: true,
            });
          }

          results.push({
            address,
            success: true,
            result: geocodeResult,
            validation,
          });
          successful++;
        } else {
          results.push({
            address,
            success: false,
            error: 'Address not found',
          });
          failed++;
        }
      } catch (error) {
        results.push({
          address,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }

      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      results,
      summary: {
        total: request.addresses.length,
        successful,
        failed,
        processingTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Get service statistics
   */
  getStats(): {
    cacheSize: number;
    remainingRequests: number;
    rateLimitPerMinute: number;
  } {
    return {
      cacheSize: this.cache.size(),
      remainingRequests: this.rateLimiter.getRemainingRequests(),
      rateLimitPerMinute: this.options.rateLimitPerMinute,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    apiKeyConfigured: boolean;
    cacheEnabled: boolean;
    rateLimitRemaining: number;
    lastError?: string;
  }> {
    const stats = this.getStats();

    try {
      // Test with a simple geocoding request
      if (this.options.apiKey) {
        await this.geocode('1600 Amphitheatre Parkway, Mountain View, CA');
      }

      return {
        status: 'healthy',
        apiKeyConfigured: !!this.options.apiKey,
        cacheEnabled: this.options.enableCaching,
        rateLimitRemaining: stats.remainingRequests,
      };
    } catch (error) {
      return {
        status: this.options.apiKey ? 'degraded' : 'unhealthy',
        apiKeyConfigured: !!this.options.apiKey,
        cacheEnabled: this.options.enableCaching,
        rateLimitRemaining: stats.remainingRequests,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();

// Export utility functions for backward compatibility
export { geocodeAddress, reverseGeocode, validateAddress };