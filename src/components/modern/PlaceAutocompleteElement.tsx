'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPinIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Extend JSX to include the Google Maps web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': any;
    }
  }
}

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  displayName: string;
  location: {
    lat: number;
    lng: number;
  };
  addressComponents: {
    longName: string;
    shortName: string;
    types: string[];
  }[];
  types: string[];
}

export interface PlaceAutocompleteElementProps {
  value?: string;
  placeholder?: string;
  onPlaceSelect?: (place: PlaceDetails) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  // API Configuration
  componentRestrictions?: { country?: string | string[] };
  fields?: string[];
  // Accessibility
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const PlaceAutocompleteElement: React.FC<PlaceAutocompleteElementProps> = ({
  value = '',
  placeholder = 'Enter an address...',
  onPlaceSelect,
  onInputChange,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false,
  error,
  componentRestrictions = { country: 'us' },
  fields = ['place_id', 'formatted_address', 'name', 'geometry', 'address_components', 'types'],
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const autocompleteRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);

  // Check if Google Maps API is loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkApiLoaded = () => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        setIsApiLoaded(true);
        setLoadError(null);
      } else {
        // Try to load the API if not already loaded
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setLoadError('Google Maps API key is not configured');
          return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Script is loading, wait for it
          const checkInterval = setInterval(() => {
            if (window.google?.maps?.places?.PlaceAutocompleteElement) {
              setIsApiLoaded(true);
              setLoadError(null);
              clearInterval(checkInterval);
            }
          }, 100);

          // Clear interval after 10 seconds
          setTimeout(() => clearInterval(checkInterval), 10000);
          return;
        }

        // Load the API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.onload = () => {
          // Wait for the API to be fully initialized
          const checkReady = setInterval(() => {
            if (window.google?.maps?.places?.PlaceAutocompleteElement) {
              setIsApiLoaded(true);
              setLoadError(null);
              clearInterval(checkReady);
            }
          }, 100);

          // Clear interval after 5 seconds
          setTimeout(() => {
            clearInterval(checkReady);
            if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
              setLoadError('Failed to initialize Google Maps Places API');
            }
          }, 5000);
        };
        script.onerror = () => {
          setLoadError('Failed to load Google Maps API');
        };
        document.head.appendChild(script);
      }
    };

    checkApiLoaded();
  }, []);

  // Handle place selection
  const handlePlaceChange = useCallback(() => {
    if (!autocompleteRef.current) return;

    try {
      const place = autocompleteRef.current.getPlace();
      
      if (!place || !place.place_id) {
        console.warn('No valid place selected');
        return;
      }

      // Convert to our PlaceDetails interface
      const placeDetails: PlaceDetails = {
        placeId: place.place_id,
        formattedAddress: place.formatted_address || '',
        displayName: place.name || place.formatted_address || '',
        location: {
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
        },
        addressComponents: (place.address_components || []).map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
        types: place.types || [],
      };

      setInputValue(placeDetails.formattedAddress);
      onPlaceSelect?.(placeDetails);
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  }, [onPlaceSelect]);

  // Handle input changes
  const handleInputChange = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
  }, [onInputChange]);

  // Set up event listeners when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !autocompleteRef.current) return;

    const element = autocompleteRef.current;

    // Add event listeners
    element.addEventListener('gmp-placeselect', handlePlaceChange);
    element.addEventListener('input', handleInputChange);

    return () => {
      // Clean up event listeners
      element.removeEventListener('gmp-placeselect', handlePlaceChange);
      element.removeEventListener('input', handleInputChange);
    };
  }, [isApiLoaded, handlePlaceChange, handleInputChange]);

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue && value !== undefined) {
      setInputValue(value);
      if (autocompleteRef.current) {
        autocompleteRef.current.value = value;
      }
    }
  }, [value, inputValue]);

  // Configure the autocomplete element
  useEffect(() => {
    if (!isApiLoaded || !autocompleteRef.current) return;

    const element = autocompleteRef.current;

    // Set component restrictions
    if (componentRestrictions?.country) {
      const countries = Array.isArray(componentRestrictions.country) 
        ? componentRestrictions.country 
        : [componentRestrictions.country];
      element.componentRestrictions = { country: countries };
    }

    // Set fields
    if (fields.length > 0) {
      element.fields = fields;
    }

    // Set other properties
    element.placeholder = placeholder;
    element.disabled = disabled;
    element.value = inputValue;
  }, [isApiLoaded, componentRestrictions, fields, placeholder, disabled, inputValue]);

  if (loadError) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{loadError}</span>
        </div>
      </div>
    );
  }

  if (!isApiLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading autocomplete...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <gmp-place-autocomplete
        ref={autocompleteRef}
        id={id}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputClassName} ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        required={required}
      />
      
      {error && (
        <div className="mt-1 flex items-center space-x-1">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
};

export default PlaceAutocompleteElement;