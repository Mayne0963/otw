import { Client } from "@googlemaps/google-maps-services-js";
import type { LatLngLiteral } from "@googlemaps/google-maps-services-js";

// Initialize Google Maps client for server-side operations
const client = new Client({});

export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
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

export async function geocodeAddress(address: string): Promise<Location> {
  const response = await client.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || "",
    },
  });

  if (!response.data.results?.[0]) {
    throw new Error("Address not found");
  }

  const result = response.data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    address: result.formatted_address,
    placeId: result.place_id,
  };
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
      mode: "driving",
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || "",
    },
  });

  if (!response.data.routes?.[0]) {
    throw new Error("Route not found");
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
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || "",
    },
  });

  return response.data.results;
}

export async function getPlaceDetails(placeId: string) {
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      fields: [
        "name",
        "formatted_address",
        "geometry",
        "rating",
        "opening_hours",
        "photos",
      ],
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || "",
    },
  });

  return response.data.result;
}

// Distance matrix for multiple origins/destinations
export async function calculateDistanceMatrix(
  origins: LatLngLiteral[],
  destinations: LatLngLiteral[],
) {
  const response = await client.distancematrix({
    params: {
      origins,
      destinations,
      mode: "driving",
      key: process.env.GOOGLE_MAPS_SERVER_API_KEY || "",
    },
  });

  return response.data;
}
