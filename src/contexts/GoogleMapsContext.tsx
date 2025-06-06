'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  googleMaps: typeof google.maps | null;
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

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleMaps, setGoogleMaps] = useState<typeof google.maps | null>(
    typeof window !== 'undefined' && window.google?.maps ? window.google.maps : null
  );

  useEffect(() => {
    // If already loaded, set state immediately
    if (isGoogleMapsLoaded && window.google?.maps) {
      setIsLoaded(true);
      setGoogleMaps(window.google.maps);
      return;
    }

    // If no API key, set error
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      setLoadError('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
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
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setLoadError(`Failed to load Google Maps API: ${error.message}`);
        setIsLoaded(false);
      });
  }, []);

  const contextValue: GoogleMapsContextType = {
    isLoaded,
    loadError,
    googleMaps,
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