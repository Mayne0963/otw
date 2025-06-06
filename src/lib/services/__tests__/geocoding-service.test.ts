import { GeocodingService } from '../geocoding-service';
import { Client } from '@googlemaps/google-maps-services-js';

// Mock the Google Maps client
jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    geocode: jest.fn(),
    reverseGeocode: jest.fn(),
  })),
}));

describe('GeocodingService', () => {
  let geocodingService: GeocodingService;
  let mockClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create service instance with test configuration
    geocodingService = new GeocodingService({
      apiKey: 'test-api-key',
      enableCaching: true,
      cacheTimeout: 1000, // 1 second for testing
      rateLimitPerMinute: 10,
      defaultLanguage: 'en',
      defaultRegion: 'US',
    });

    // Get the mocked client
    mockClient = new Client();
  });

  afterEach(() => {
    // Clear cache after each test
    geocodingService.clearCache();
  });

  describe('geocode', () => {
    const mockGeocodeResponse = {
      data: {
        results: [{
          formatted_address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
          geometry: {
            location: { lat: 37.4224764, lng: -122.0842499 },
            location_type: 'ROOFTOP',
            viewport: {
              northeast: { lat: 37.4238253802915, lng: -122.0829009197085 },
              southwest: { lat: 37.4211274197085, lng: -122.0855988802915 },
            },
          },
          place_id: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
          types: ['street_address'],
          address_components: [
            {
              long_name: '1600',
              short_name: '1600',
              types: ['street_number'],
            },
            {
              long_name: 'Amphitheatre Parkway',
              short_name: 'Amphitheatre Pkwy',
              types: ['route'],
            },
          ],
          partial_match: false,
        }],
      },
    };

    it('should geocode an address successfully', async () => {
      mockClient.geocode.mockResolvedValue(mockGeocodeResponse);

      const result = await geocodingService.geocode('1600 Amphitheatre Parkway, Mountain View, CA');

      expect(result).toBeDefined();
      expect(result?.formatted_address).toBe('1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA');
      expect(result?.geometry.location.lat).toBe(37.4224764);
      expect(result?.geometry.location.lng).toBe(-122.0842499);
      expect(mockClient.geocode).toHaveBeenCalledTimes(1);
    });

    it('should return null for address not found', async () => {
      mockClient.geocode.mockResolvedValue({ data: { results: [] } });

      const result = await geocodingService.geocode('Invalid Address 12345');

      expect(result).toBeNull();
    });

    it('should use cache for repeated requests', async () => {
      mockClient.geocode.mockResolvedValue(mockGeocodeResponse);

      // First request
      const result1 = await geocodingService.geocode('1600 Amphitheatre Parkway');

      // Second request (should use cache)
      const result2 = await geocodingService.geocode('1600 Amphitheatre Parkway');

      expect(result1).toEqual(result2);
      expect(mockClient.geocode).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('should handle API errors gracefully', async () => {
      mockClient.geocode.mockRejectedValue(new Error('API Error'));

      await expect(geocodingService.geocode('Test Address'))
        .rejects.toThrow('Failed to geocode address: Test Address');
    });

    it('should throw error when API key is missing', async () => {
      const serviceWithoutKey = new GeocodingService({ apiKey: '' });

      await expect(serviceWithoutKey.geocode('Test Address'))
        .rejects.toThrow('Google Maps API key is required for geocoding');
    });

    it('should apply component restrictions', async () => {
      mockClient.geocode.mockResolvedValue(mockGeocodeResponse);

      await geocodingService.geocode('Test Address', {
        componentRestrictions: {
          country: 'US',
          locality: 'Mountain View',
        },
      });

      expect(mockClient.geocode).toHaveBeenCalledWith({
        params: expect.objectContaining({
          components: 'country:US|locality:Mountain View',
        }),
      });
    });
  });

  describe('reverseGeocode', () => {
    const mockReverseGeocodeResponse = {
      data: {
        results: [{
          formatted_address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
          geometry: {
            location: { lat: 37.4224764, lng: -122.0842499 },
            location_type: 'ROOFTOP',
          },
          place_id: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
          types: ['street_address'],
          address_components: [],
        }],
      },
    };

    it('should reverse geocode coordinates successfully', async () => {
      mockClient.reverseGeocode.mockResolvedValue(mockReverseGeocodeResponse);

      const result = await geocodingService.reverseGeocode(37.4224764, -122.0842499);

      expect(result).toBeDefined();
      expect(result?.formatted_address).toBe('1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA');
      expect(mockClient.reverseGeocode).toHaveBeenCalledTimes(1);
    });

    it('should return null when no results found', async () => {
      mockClient.reverseGeocode.mockResolvedValue({ data: { results: [] } });

      const result = await geocodingService.reverseGeocode(0, 0);

      expect(result).toBeNull();
    });

    it('should apply result type filters', async () => {
      mockClient.reverseGeocode.mockResolvedValue(mockReverseGeocodeResponse);

      await geocodingService.reverseGeocode(37.4224764, -122.0842499, {
        resultTypes: ['street_address'],
        locationTypes: ['ROOFTOP'],
      });

      expect(mockClient.reverseGeocode).toHaveBeenCalledWith({
        params: expect.objectContaining({
          result_type: 'street_address',
          location_type: 'ROOFTOP',
        }),
      });
    });
  });

  describe('validateAddress', () => {
    const mockValidGeocodeResponse = {
      data: {
        results: [{
          formatted_address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
          geometry: {
            location: { lat: 37.4224764, lng: -122.0842499 },
            location_type: 'ROOFTOP',
          },
          place_id: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
          types: ['street_address'],
          address_components: [
            {
              long_name: '1600',
              short_name: '1600',
              types: ['street_number'],
            },
            {
              long_name: 'Amphitheatre Parkway',
              short_name: 'Amphitheatre Pkwy',
              types: ['route'],
            },
            {
              long_name: 'Mountain View',
              short_name: 'Mountain View',
              types: ['locality'],
            },
          ],
          partial_match: false,
        }],
      },
    };

    it('should validate a valid address', async () => {
      mockClient.geocode.mockResolvedValue(mockValidGeocodeResponse);

      const result = await geocodingService.validateAddress('1600 Amphitheatre Parkway, Mountain View, CA');

      expect(result.isValid).toBe(true);
      expect(result.isDeliverable).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.geocodeResult).toBeDefined();
    });

    it('should detect partial matches', async () => {
      const partialMatchResponse = {
        ...mockValidGeocodeResponse,
        data: {
          results: [{
            ...mockValidGeocodeResponse.data.results[0],
            partial_match: true,
          }],
        },
      };

      mockClient.geocode.mockResolvedValue(partialMatchResponse);

      const result = await geocodingService.validateAddress('Partial Address');

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.issues).toContain('Address is a partial match - please verify');
    });

    it('should detect missing street number for delivery', async () => {
      const noStreetNumberResponse = {
        ...mockValidGeocodeResponse,
        data: {
          results: [{
            ...mockValidGeocodeResponse.data.results[0],
            address_components: [
              {
                long_name: 'Amphitheatre Parkway',
                short_name: 'Amphitheatre Pkwy',
                types: ['route'],
              },
            ],
          }],
        },
      };

      mockClient.geocode.mockResolvedValue(noStreetNumberResponse);

      const result = await geocodingService.validateAddress('Amphitheatre Parkway', {
        checkDeliverability: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.isDeliverable).toBe(false);
      expect(result.issues).toContain('No street number found - please provide a complete address');
    });

    it('should reject PO Box addresses when not allowed', async () => {
      const poBoxResponse = {
        ...mockValidGeocodeResponse,
        data: {
          results: [{
            ...mockValidGeocodeResponse.data.results[0],
            formatted_address: 'PO Box 123, Mountain View, CA 94043, USA',
          }],
        },
      };

      mockClient.geocode.mockResolvedValue(poBoxResponse);

      const result = await geocodingService.validateAddress('PO Box 123', {
        allowPOBoxes: false,
      });

      expect(result.isValid).toBe(true);
      expect(result.isDeliverable).toBe(false);
      expect(result.issues).toContain('PO Box addresses are not supported');
    });

    it('should check required components', async () => {
      mockClient.geocode.mockResolvedValue(mockValidGeocodeResponse);

      const result = await geocodingService.validateAddress('Test Address', {
        requiredComponents: ['street_number', 'route', 'locality', 'postal_code'],
      });

      expect(result.isValid).toBe(true);
      expect(result.isDeliverable).toBe(false); // Missing postal_code
      expect(result.issues).toContain('Missing required address components: postal_code');
    });
  });

  describe('batchGeocode', () => {
    it('should process multiple addresses', async () => {
      const mockResponse = {
        data: {
          results: [{
            formatted_address: 'Test Address',
            geometry: { location: { lat: 37.4224764, lng: -122.0842499 }, location_type: 'ROOFTOP' },
            place_id: 'test-place-id',
            types: ['street_address'],
            address_components: [],
          }],
        },
      };

      mockClient.geocode.mockResolvedValue(mockResponse);

      const result = await geocodingService.batchGeocode({
        addresses: ['Address 1', 'Address 2'],
        options: { validateDelivery: false },
      });

      expect(result.summary.total).toBe(2);
      expect(result.summary.successful).toBe(2);
      expect(result.summary.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(mockClient.geocode).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success and failure', async () => {
      mockClient.geocode
        .mockResolvedValueOnce({
          data: {
            results: [{
              formatted_address: 'Valid Address',
              geometry: { location: { lat: 37.4224764, lng: -122.0842499 }, location_type: 'ROOFTOP' },
              place_id: 'test-place-id',
              types: ['street_address'],
              address_components: [],
            }],
          },
        })
        .mockResolvedValueOnce({ data: { results: [] } }); // No results for second address

      const result = await geocodingService.batchGeocode({
        addresses: ['Valid Address', 'Invalid Address'],
      });

      expect(result.summary.total).toBe(2);
      expect(result.summary.successful).toBe(1);
      expect(result.summary.failed).toBe(1);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe('Address not found');
    });
  });

  describe('rate limiting', () => {
    it('should track rate limit usage', () => {
      const stats = geocodingService.getStats();

      expect(stats.rateLimitPerMinute).toBe(10);
      expect(stats.remainingRequests).toBeLessThanOrEqual(10);
    });

    it('should throw error when rate limit exceeded', async () => {
      // Exhaust rate limit
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(geocodingService.geocode(`Address ${i}`).catch(() => {}));
      }

      await Promise.all(promises);

      // This should fail due to rate limit
      await expect(geocodingService.geocode('Test Address'))
        .rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('caching', () => {
    it('should cache results', async () => {
      const mockResponse = {
        data: {
          results: [{
            formatted_address: 'Cached Address',
            geometry: { location: { lat: 37.4224764, lng: -122.0842499 }, location_type: 'ROOFTOP' },
            place_id: 'cached-place-id',
            types: ['street_address'],
            address_components: [],
          }],
        },
      };

      mockClient.geocode.mockResolvedValue(mockResponse);

      // First call
      await geocodingService.geocode('Test Address');

      // Second call should use cache
      await geocodingService.geocode('Test Address');

      expect(mockClient.geocode).toHaveBeenCalledTimes(1);

      const stats = geocodingService.getStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });

    it('should clear cache', async () => {
      const mockResponse = {
        data: {
          results: [{
            formatted_address: 'Test Address',
            geometry: { location: { lat: 37.4224764, lng: -122.0842499 }, location_type: 'ROOFTOP' },
            place_id: 'test-place-id',
            types: ['street_address'],
            address_components: [],
          }],
        },
      };

      mockClient.geocode.mockResolvedValue(mockResponse);

      await geocodingService.geocode('Test Address');
      expect(geocodingService.getStats().cacheSize).toBeGreaterThan(0);

      geocodingService.clearCache();
      expect(geocodingService.getStats().cacheSize).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when service is working', async () => {
      mockClient.geocode.mockResolvedValue({
        data: {
          results: [{
            formatted_address: 'Test',
            geometry: { location: { lat: 37.4224764, lng: -122.0842499 }, location_type: 'ROOFTOP' },
            place_id: 'test',
            types: ['street_address'],
            address_components: [],
          }],
        },
      });

      const health = await geocodingService.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.apiKeyConfigured).toBe(true);
      expect(health.cacheEnabled).toBe(true);
    });

    it('should return unhealthy status when API key is missing', async () => {
      const serviceWithoutKey = new GeocodingService({ apiKey: '' });

      const health = await serviceWithoutKey.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.apiKeyConfigured).toBe(false);
    });
  });
});