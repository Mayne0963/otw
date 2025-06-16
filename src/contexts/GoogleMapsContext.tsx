'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  googleMaps: typeof google.maps | null;
  placesService: google.maps.places.PlacesService | null;
  // Modern Places API methods
  Place: typeof google.maps.places.Place | null;
  searchPlaces: (request: google.maps.places.SearchByTextRequest) => Promise<google.maps.places.SearchByTextResponse | null>;
  getPlaceDetails: (placeId: string) => Promise<google.maps.places.Place | null>;
  // Note: autocompleteService removed - use PlaceAutocompleteElement instead
}

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
};

let loaderPromise: Promise<typeof google> | null = null;
let isGoogleMapsLoaded = false;
let globalPlacesService: google.maps.places.PlacesService | null = null;
let globalPlaceClass: typeof google.maps.places.Place | null = null;
// globalAutocompleteService removed - using PlaceAutocompleteElement instead

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleMaps, setGoogleMaps] = useState<typeof google.maps | null>(
    typeof window !== 'undefined' && window.google?.maps ? window.google.maps : null,
  );
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(globalPlacesService);
  const [Place, setPlace] = useState<typeof google.maps.places.Place | null>(globalPlaceClass);
  // autocompleteService state removed - using PlaceAutocompleteElement instead

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

  useEffect(() => {
    // If already loaded, set state immediately
    if (isGoogleMapsLoaded && window.google?.maps) {
      setIsLoaded(true);
      setGoogleMaps(window.google.maps);
      if (globalPlacesService) {setPlacesService(globalPlacesService);}
      if (globalPlaceClass) {setPlace(globalPlaceClass);}
      // AutocompleteService initialization removed
      return;
    }

    // If no API key, set error
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      setLoadError('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
      return;
    }

    // Validate API key format
    if (GOOGLE_MAPS_CONFIG.apiKey.length < 30) {
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

        // Initialize services
        try {
          // Create a dummy div for PlacesService (legacy support)
          const serviceDiv = document.createElement('div');
          globalPlacesService = new google.maps.places.PlacesService(serviceDiv);
          
          // Initialize modern Place API
          if (google.maps.places.Place) {
            globalPlaceClass = google.maps.places.Place;
            setPlace(globalPlaceClass);
          }
          // AutocompleteService initialization removed - using PlaceAutocompleteElement

          setPlacesService(globalPlacesService);
        } catch (error) {
          console.error('Failed to initialize Google Places services:', error);
          setLoadError('Failed to initialize Google Places services. Please check your API key permissions.');
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);

        // Provide specific error messages based on common issues
        let errorMessage = 'Failed to load Google Maps API';

        if (error.message?.includes('ApiTargetBlockedMapError')) {
          errorMessage = 'Google Maps API access blocked. Please check your API key restrictions and enable Places API.';
        } else if (error.message?.includes('REQUEST_DENIED')) {
          errorMessage = 'Google Maps API request denied. Please verify your API key and enable required APIs (Places API, Maps JavaScript API).';
        } else if (error.message?.includes('INVALID_REQUEST')) {
          errorMessage = 'Invalid Google Maps API request. Please check your API key configuration.';
        } else if (error.message?.includes('OVER_QUERY_LIMIT')) {
          errorMessage = 'Google Maps API quota exceeded. Please check your usage limits.';
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
    Place,
    searchPlaces,
    getPlaceDetails,
    // autocompleteService removed - use PlaceAutocompleteElement instead
  };

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps(): GoogleMapsContextType {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}

// Helper hook for components that need to wait for Google Maps to load
export function useGoogleMapsReady(): boolean {
  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (loadError) {
      console.error('Google Maps loading error:', loadError);
    }
  }, [loadError]);

  return isLoaded && !loadError;
}

// Export the loader promise for advanced use cases
export { loaderPromise };