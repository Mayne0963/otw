import { Client } from '@googlemaps/google-maps-services-js';
import type { LatLngLiteral } from '@googlemaps/google-maps-services-js';


// Initialize Google Maps client for server-side operations
const client = new Client({});

interface Location {
  lat: number;
  lng: number;
}





interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: Location;
    location_type: string;
  };
  place_id: string;
  types: string[];
  address_components: google.maps.GeocoderAddressComponent[];
}



export interface RouteInfo {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  polyline: string;
}



export async function calculateRoute(
  origin: LatLngLiteral,
  destination: LatLngLiteral,
  waypoints?: LatLngLiteral[],
): Promise<RouteInfo> {
  const response = await client.directions({
    params: {
      origin,
      destination,
      waypoints,
      optimize: true, // Optimize waypoint order if present
      mode: 'driving',
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
    },
  });

  if (!response.data.routes?.[0]) {
    throw new Error('Route not found');
  }

  const route = response.data.routes[0].legs[0];
  return {
    distance: route.distance,
    duration: route.duration,
    polyline: response.data.routes[0].overview_polyline.points,
  };
}

export async function searchNearbyPlaces(
  location: LatLngLiteral,
  type: string,
  radius = 5000, // 5km default radius
) {
  const response = await client.placesNearby({
    params: {
      location,
      radius,
      type,
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
    },
  });

  return response.data.results;
}

export async function getPlaceDetails(placeId: string) {
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      fields: [
        'name',
        'formatted_address',
        'geometry',
        'rating',
        'opening_hours',
        'photos',
      ],
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
    },
  });

  return response.data.result;
}

// Distance matrix for multiple origins/destinations
export async function calculateDistanceMatrix(
  origins: LatLngLiteral[],
  destinations: LatLngLiteral[],
): Promise<DistanceMatrixResult[][]> {
  try {
    const response = await client.distancematrix({
      params: {
        origins,
        destinations,
        key: process.env.GOOGLE_MAPS_API_KEY!,
        units: 'imperial',
        mode: 'driving',
      },
    });

    return response.data.rows.map(row =>
      row.elements.map(element => ({
        distance: element.distance!,
        duration: element.duration!,
        status: element.status,
      })),
    );
  } catch (error) {
    console.error('Error calculating distance matrix:', error);
    throw new Error('Failed to calculate distance matrix');
  }
}

/**
 * Geocode an address to get coordinates and detailed information
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];
    return {
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
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error(`Failed to geocode address: ${address}`);
  }
}

/**
 * Reverse geocode coordinates to get address information
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    if (response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];
    return {
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
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw new Error(`Failed to reverse geocode coordinates: ${lat}, ${lng}`);
  }
}

/**
 * Validate if an address exists and is deliverable
 */
export async function validateAddress(address: string): Promise<{
  isValid: boolean;
  isDeliverable: boolean;
  geocodeResult?: GeocodeResult;
  issues?: string[];
}> {
  try {
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult) {
      return {
        isValid: false,
        isDeliverable: false,
        issues: ['Address not found'],
      };
    }

    const issues: string[] = [];
    let isDeliverable = true;

    // Check location type precision
    if (geocodeResult.geometry.location_type === 'APPROXIMATE') {
      issues.push('Address is approximate - please provide more specific details');
      isDeliverable = false;
    }

    // Check if it's a valid street address
    const hasStreetNumber = geocodeResult.address_components.some(
      component => component.types.includes('street_number'),
    );

    if (!hasStreetNumber) {
      issues.push('No street number found - please provide a complete address');
      isDeliverable = false;
    }

    // Check for PO Box (not deliverable for most services)
    if (geocodeResult.formatted_address.toLowerCase().includes('po box')) {
      issues.push('PO Box addresses are not supported for delivery');
      isDeliverable = false;
    }

    return {
      isValid: true,
      isDeliverable,
      geocodeResult,
      issues: issues.length > 0 ? issues : undefined,
    };
  } catch (error) {
    console.error('Error validating address:', error);
    return {
      isValid: false,
      isDeliverable: false,
      issues: ['Failed to validate address'],
    };
  }
}

/**
 * Calculate the straight-line distance between two points (Haversine formula)
 */
export function calculateStraightLineDistance(
  point1: Location,
  point2: Location,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a location is within a delivery zone
 */
export function isWithinDeliveryZone(
  location: Location,
  centerPoint: Location,
  radiusMiles: number,
): boolean {
  const distance = calculateStraightLineDistance(location, centerPoint);
  return distance <= radiusMiles;
}

/**
 * Get delivery zones for multiple locations
 */
export function getDeliveryZones(
  locations: Location[],
  centerPoint: Location,
  radiusMiles: number,
): { location: Location; isInZone: boolean; distance: number }[] {
  return locations.map(location => {
    const distance = calculateStraightLineDistance(location, centerPoint);
    return {
      location,
      isInZone: distance <= radiusMiles,
      distance,
    };
  });
}
