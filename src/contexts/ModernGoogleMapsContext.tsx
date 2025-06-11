'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  googleMaps: typeof google.maps | null;
  placesService: google.maps.places.PlacesService | null;
  // Modern Places API methods
  searchPlaces: (request: google.maps.places.SearchByTextRequest) => Promise<google.maps.places.SearchByTextResponse | null>;
  getPlaceDetails: (placeId: string) => Promise<google.maps.places.Place | null>;
}

// Note: AutocompleteOptions removed as we now use PlaceAutocompleteElement

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

interface GoogleMapsProviderProps {
  children: ReactNode;
}

const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry', 'drawing'] as const,
  region: 'US',
  language: 'en',
  // Add retry configuration
  retries: 3,
  timeout: 10000, // 10 seconds
};

// Global state management
let loaderPromise: Promise<typeof google> | null = null;
let isGoogleMapsLoaded = false;
let globalPlacesService: google.maps.places.PlacesService | null = null;

export function ModernGoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleMaps, setGoogleMaps] = useState<typeof google.maps | null>(
    typeof window !== 'undefined' && window.google?.maps ? window.google.maps : null,
  );
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(globalPlacesService);
  // AutocompleteService removed - using PlaceAutocompleteElement instead

  // Modern Places API: Search places by text
  const searchPlaces = useCallback(async (request: google.maps.places.SearchByTextRequest): Promise<google.maps.places.SearchByTextResponse | null> => {
    if (!isLoaded || !window.google?.maps?.places?.Place) {
      console.warn('Google Maps Places API not loaded');
      return null;
    }

    try {
      const { Place } = window.google.maps.places;
      const response = await Place.searchByText(request);
      return response;
    } catch (error) {
      console.error('Error searching places:', error);
      return null;
    }
  }, [isLoaded]);

  // Modern Places API: Get place details
  const getPlaceDetails = useCallback(async (placeId: string): Promise<google.maps.places.Place | null> => {
    if (!isLoaded || !window.google?.maps?.places?.Place) {
      console.warn('Google Maps Places API not loaded');
      return null;
    }

    try {
      const { Place } = window.google.maps.places;
      const place = new Place({ id: placeId });
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'types', 'id'],
      });
      return place;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }, [isLoaded]);

  // getAutocompleteSuggestions removed - use PlaceAutocompleteElement instead

  useEffect(() => {
    // If already loaded, set state immediately
    if (isGoogleMapsLoaded && window.google?.maps) {
      setIsLoaded(true);
      setGoogleMaps(window.google.maps);
      if (globalPlacesService) {setPlacesService(globalPlacesService);}
      // AutocompleteService initialization removed
      return;
    }

    // Validate API key
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      setLoadError('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
      return;
    }

    if (GOOGLE_MAPS_CONFIG.apiKey.length < 30 || !GOOGLE_MAPS_CONFIG.apiKey.startsWith('AIza')) {
      setLoadError('Invalid Google Maps API key format. Please check your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
      return;
    }

    // Create loader promise only once
    if (!loaderPromise) {
      const loader = new Loader(GOOGLE_MAPS_CONFIG);
      loaderPromise = loader.load();
    }

    // Load Google Maps API
    loaderPromise
      .then((google) => {
        isGoogleMapsLoaded = true;
        setIsLoaded(true);
        setGoogleMaps(google.maps);
        setLoadError(null);

        // Initialize legacy services for backward compatibility
        try {
          const serviceDiv = document.createElement('div');
          globalPlacesService = new google.maps.places.PlacesService(serviceDiv);
          // AutocompleteService initialization removed - using PlaceAutocompleteElement

          setPlacesService(globalPlacesService);
        } catch (error) {
          console.error('Failed to initialize Google Places services:', error);
          setLoadError('Failed to initialize Google Places services. Please check your API key permissions.');
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);

        // Provide specific error messages
        let errorMessage = 'Failed to load Google Maps API';

        if (error.message?.includes('ApiTargetBlockedMapError')) {
          errorMessage = 'Google Maps API access blocked. Please check your API key restrictions and enable Places API in Google Cloud Console.';
        } else if (error.message?.includes('REQUEST_DENIED')) {
          errorMessage = 'Google Maps API request denied. Please verify your API key and enable required APIs (Places API, Maps JavaScript API, Geocoding API).';
        } else if (error.message?.includes('INVALID_REQUEST')) {
          errorMessage = 'Invalid Google Maps API request. Please check your API key configuration and billing setup.';
        } else if (error.message?.includes('OVER_QUERY_LIMIT')) {
          errorMessage = 'Google Maps API quota exceeded. Please check your usage limits and billing account.';
        } else if (error.message?.includes('RefererNotAllowedMapError')) {
          errorMessage = 'Domain not authorized for this API key. Please add your domain to the API key restrictions.';
        } else {
          errorMessage = `Google Maps API error: ${error.message}`;
        }

        setLoadError(errorMessage);
        setIsLoaded(false);
      });
  }, []);

  const contextValue: GoogleMapsContextType = {
    isLoaded,
    loadError,
    googleMaps,
    placesService,
    searchPlaces,
    getPlaceDetails,
  };

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useModernGoogleMaps(): GoogleMapsContextType {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useModernGoogleMaps must be used within a ModernGoogleMapsProvider');
  }
  return context;
}

// Helper hook for components that need to wait for Google Maps to load
export function useGoogleMapsReady(): boolean {
  const { isLoaded, loadError } = useModernGoogleMaps();

  useEffect(() => {
    if (loadError) {
      console.error('Google Maps loading error:', loadError);
    }
  }, [loadError]);

  return isLoaded && !loadError;
}

// Export the loader promise for advanced use cases
export { loaderPromise };