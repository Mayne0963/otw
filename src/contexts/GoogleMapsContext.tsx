'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  googleMaps: typeof google.maps | null;
  placesService: google.maps.places.PlacesService | null;
  autocompleteService: google.maps.places.AutocompleteService | null;
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
let globalAutocompleteService: google.maps.places.AutocompleteService | null = null;

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleMaps, setGoogleMaps] = useState<typeof google.maps | null>(
    typeof window !== 'undefined' && window.google?.maps ? window.google.maps : null,
  );
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(globalPlacesService);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(globalAutocompleteService);

  useEffect(() => {
    // If already loaded, set state immediately
    if (isGoogleMapsLoaded && window.google?.maps) {
      setIsLoaded(true);
      setGoogleMaps(window.google.maps);
      if (globalPlacesService) {setPlacesService(globalPlacesService);}
      if (globalAutocompleteService) {setAutocompleteService(globalAutocompleteService);}
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
          // Create a dummy div for PlacesService
          const serviceDiv = document.createElement('div');
          globalPlacesService = new google.maps.places.PlacesService(serviceDiv);
          globalAutocompleteService = new google.maps.places.AutocompleteService();

          setPlacesService(globalPlacesService);
          setAutocompleteService(globalAutocompleteService);
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
    autocompleteService,
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