# Backend Geocoding Service Setup

This guide explains how to set up and use the enhanced geocoding service on your backend.

## Overview

The enhanced geocoding service provides:
- **Caching**: Reduces API calls and improves performance
- **Rate Limiting**: Prevents API quota exhaustion
- **Batch Processing**: Handle multiple addresses efficiently
- **Address Validation**: Comprehensive validation with delivery checks
- **Error Handling**: Robust error handling with detailed responses
- **Health Monitoring**: Service health checks and statistics

## Setup

### 1. Environment Variables

Ensure your `.env.local` file contains:

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Service Configuration

The geocoding service can be configured with various options:

```typescript
import { GeocodingService } from '@/lib/services/geocoding-service';

// Create a custom instance with specific options
const customGeocodingService = new GeocodingService({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  enableCaching: true,
  cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
  rateLimitPerMinute: 50,
  defaultLanguage: 'en',
  defaultRegion: 'US'
});
```

## API Endpoints

### GET Endpoints

#### 1. Geocode Address
```
GET /api/maps?action=geocode&address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&language=en&region=US
```

**Parameters:**
- `address` (required): The address to geocode
- `language` (optional): Language for results (default: 'en')
- `region` (optional): Region bias (default: 'US')

**Response:**
```json
{
  "formatted_address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
  "geometry": {
    "location": {
      "lat": 37.4224764,
      "lng": -122.0842499
    },
    "location_type": "ROOFTOP"
  },
  "place_id": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
  "types": ["street_address"]
}
```

#### 2. Reverse Geocode
```
GET /api/maps?action=reverse&lat=37.4224764&lng=-122.0842499&language=en
```

**Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `language` (optional): Language for results

#### 3. Validate Address
```
GET /api/maps?action=validate&address=1600+Amphitheatre+Parkway&strict=true
```

**Parameters:**
- `address` (required): Address to validate
- `strict` (optional): Enable strict validation (default: false)

**Response:**
```json
{
  "isValid": true,
  "isDeliverable": true,
  "geocodeResult": { /* geocoding result */ },
  "confidence": "high",
  "issues": []
}
```

#### 4. Health Check
```
GET /api/maps?action=health
```

**Response:**
```json
{
  "status": "healthy",
  "apiKeyConfigured": true,
  "cacheEnabled": true,
  "rateLimitRemaining": 45
}
```

#### 5. Service Statistics
```
GET /api/maps?action=stats
```

**Response:**
```json
{
  "cacheSize": 150,
  "remainingRequests": 45,
  "rateLimitPerMinute": 50
}
```

### POST Endpoints

#### 1. Enhanced Geocoding
```javascript
fetch('/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'geocode',
    address: '1600 Amphitheatre Parkway, Mountain View, CA',
    options: {
      language: 'en',
      region: 'US',
      bounds: {
        northeast: { lat: 37.5, lng: -122.0 },
        southwest: { lat: 37.4, lng: -122.1 }
      },
      componentRestrictions: {
        country: 'US',
        locality: 'Mountain View'
      }
    }
  })
});
```

#### 2. Batch Geocoding
```javascript
fetch('/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'batch-geocode',
    addresses: [
      '1600 Amphitheatre Parkway, Mountain View, CA',
      '1 Hacker Way, Menlo Park, CA',
      '410 Terry Ave N, Seattle, WA'
    ],
    options: {
      validateDelivery: true,
      includeTimezone: false,
      language: 'en'
    }
  })
});
```

**Response:**
```json
{
  "results": [
    {
      "address": "1600 Amphitheatre Parkway, Mountain View, CA",
      "success": true,
      "result": { /* geocoding result */ },
      "validation": {
        "isValid": true,
        "isDeliverable": true
      }
    }
  ],
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "processingTime": 1250
  }
}
```

#### 3. Address Validation
```javascript
fetch('/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'validate',
    address: '1600 Amphitheatre Parkway, Mountain View, CA',
    validationOptions: {
      strictValidation: true,
      checkDeliverability: true,
      allowPOBoxes: false,
      allowApproximateMatches: false,
      requiredComponents: ['street_number', 'route', 'locality']
    }
  })
});
```

#### 4. Reverse Geocoding
```javascript
fetch('/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'reverse-geocode',
    lat: 37.4224764,
    lng: -122.0842499,
    options: {
      language: 'en',
      resultTypes: ['street_address'],
      locationTypes: ['ROOFTOP']
    }
  })
});
```

#### 5. Clear Cache
```javascript
fetch('/api/maps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'clear-cache'
  })
});
```

## Frontend Integration

### Basic Usage

```typescript
// utils/geocoding.ts
export async function geocodeAddress(address: string) {
  try {
    const response = await fetch(`/api/maps?action=geocode&address=${encodeURIComponent(address)}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Geocoding failed');
    }
    
    return result;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

export async function validateAddress(address: string, strict = false) {
  try {
    const response = await fetch(`/api/maps?action=validate&address=${encodeURIComponent(address)}&strict=${strict}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Validation failed');
    }
    
    return result;
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

export async function batchGeocode(addresses: string[]) {
  try {
    const response = await fetch('/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'batch-geocode',
        addresses,
        options: {
          validateDelivery: true
        }
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Batch geocoding failed');
    }
    
    return result;
  } catch (error) {
    console.error('Batch geocoding error:', error);
    throw error;
  }
}
```

### React Hook Example

```typescript
// hooks/useGeocoding.ts
import { useState, useCallback } from 'react';
import { geocodeAddress, validateAddress } from '@/utils/geocoding';

export function useGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geocodeAddress(address);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Geocoding failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validate = useCallback(async (address: string, strict = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await validateAddress(address, strict);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    geocode,
    validate,
    loading,
    error
  };
}
```

### Component Example

```typescript
// components/AddressValidator.tsx
import React, { useState } from 'react';
import { useGeocoding } from '@/hooks/useGeocoding';

export function AddressValidator() {
  const [address, setAddress] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const { validate, loading, error } = useGeocoding();

  const handleValidate = async () => {
    if (!address.trim()) return;
    
    try {
      const result = await validate(address, true);
      setValidationResult(result);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address to validate"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleValidate}
          disabled={loading || !address.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Validating...' : 'Validate Address'}
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {validationResult && (
        <div className={`p-3 rounded ${
          validationResult.isValid 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <h3 className="font-semibold">
            {validationResult.isValid ? 'Valid Address' : 'Invalid Address'}
          </h3>
          <p>Deliverable: {validationResult.isDeliverable ? 'Yes' : 'No'}</p>
          <p>Confidence: {validationResult.confidence}</p>
          {validationResult.issues && (
            <ul className="mt-2 list-disc list-inside">
              {validationResult.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

The service provides comprehensive error handling:

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (missing parameters, invalid input)
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details (in development)"
}
```

### Rate Limiting
The service implements rate limiting to prevent API quota exhaustion:
- Default: 50 requests per minute
- Configurable per service instance
- Returns 429 status when limit exceeded

## Monitoring and Maintenance

### Health Checks
Regularly check service health:
```javascript
const healthCheck = await fetch('/api/maps?action=health');
const status = await healthCheck.json();
console.log('Service status:', status.status);
```

### Cache Management
- Cache automatically expires after 24 hours (configurable)
- Manual cache clearing available via API
- Monitor cache size through stats endpoint

### Performance Optimization
1. **Enable Caching**: Reduces API calls for repeated addresses
2. **Batch Processing**: Use batch geocoding for multiple addresses
3. **Rate Limiting**: Prevents quota exhaustion
4. **Address Validation**: Catch invalid addresses early

## Production Considerations

### Security
- API key is server-side only
- Input validation on all endpoints
- Rate limiting prevents abuse

### Scalability
- Consider Redis for distributed caching
- Implement database logging for audit trails
- Monitor API usage and costs

### Monitoring
- Set up alerts for API quota usage
- Monitor error rates and response times
- Track cache hit rates

## Troubleshooting

### Common Issues

1. **"Google Maps API key not configured"**
   - Check `.env.local` file
   - Ensure API key has Geocoding API enabled
   - Verify API key permissions

2. **"Rate limit exceeded"**
   - Wait for rate limit reset (1 minute)
   - Consider increasing rate limit
   - Implement request queuing

3. **"Address not found"**
   - Check address format
   - Try less specific address
   - Use address validation first

4. **Cache issues**
   - Clear cache via API
   - Check cache timeout settings
   - Monitor cache size

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This provides additional error details in API responses.