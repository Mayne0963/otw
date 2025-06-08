'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

// Extend JSX to include the Google Maps web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': any;
    }
  }
}

interface PlaceDetails {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: google.maps.GeocoderAddressComponent[];
  name?: string;
}

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  // Client-side filtering (componentRestrictions not supported in PlaceAutocompleteElement)
  countryFilter?: string | string[];
  typeFilter?: string[];
  value?: string;
  onChange?: (value: string) => void;
  // Additional modern props
  fields?: string[];
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  required?: boolean;
  error?: string;
}

export default function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = 'Enter an address...',
  className = '',
  disabled = false,
  showIcon = true,
  countryFilter,
  typeFilter,
  value,
  onChange,
  fields = ['place_id', 'formatted_address', 'name', 'geometry', 'address_components'],
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  required = false,
  error,
}: PlaceAutocompleteProps) {
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);

  // Use the centralized Google Maps context
  const { isLoaded, loadError } = useModernGoogleMaps();

  // Check if Google Maps API is loaded and initialize
  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    const checkApiLoaded = () => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        setIsApiLoaded(true);
        setApiLoadError(null);
      } else if (isLoaded) {
        // API should be loaded but PlaceAutocompleteElement is not available
        setApiLoadError('PlaceAutocompleteElement not available in this API version');
      }
    };

    checkApiLoaded();
  }, [isLoaded]);

  // Handle place selection
  const handlePlaceChange = useCallback(() => {
    if (!autocompleteRef.current) {return;}

    try {
      const place = autocompleteRef.current.getPlace();

      if (!place || !place.place_id) {
        console.warn('No valid place selected');
        return;
      }

      // Apply client-side country filtering if specified
      if (countryFilter && place.address_components) {
        const countries = Array.isArray(countryFilter) ? countryFilter : [countryFilter];
        const countryComponent = place.address_components.find(
          (component: any) => component.types.includes('country'),
        );

        if (countryComponent) {
          const countryCode = countryComponent.short_name.toLowerCase();
          const countryName = countryComponent.long_name.toLowerCase();
          const isValidCountry = countries.some(filter =>
            filter.toLowerCase() === countryCode ||
            filter.toLowerCase() === countryName,
          );

          if (!isValidCountry) {
            console.log('Place filtered out due to country restriction:', countryComponent);
            return;
          }
        }
      }

      // Apply client-side type filtering if specified
      if (typeFilter && typeFilter.length > 0) {
        const hasValidType = typeFilter.some(filterType =>
          place.types && place.types.includes(filterType),
        );

        if (!hasValidType) {
          console.log('Place filtered out due to type restriction:', place.types);
          return;
        }
      }

      // Convert to our PlaceDetails interface
      const placeDetails: PlaceDetails = {
        place_id: place.place_id,
        formatted_address: place.formatted_address || '',
        name: place.name || place.formatted_address || '',
        geometry: {
          location: {
            lat: () => place.geometry?.location?.lat() || 0,
            lng: () => place.geometry?.location?.lng() || 0,
          },
        },
        address_components: place.address_components || [],
      };

      setInputValue(placeDetails.formatted_address);
      onPlaceSelect(placeDetails);
      onChange?.(placeDetails.formatted_address);
    } catch (error) {
      console.error('Error handling place selection:', error);
      setApiLoadError('Error processing place selection');
    }
  }, [onPlaceSelect, onChange, countryFilter, typeFilter]);

  // Handle input changes
  const handleInputChange = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // Set up event listeners when API is loaded
  useEffect(() => {
    if (!isApiLoaded || !autocompleteRef.current) {return;}

    const element = autocompleteRef.current;

    // Add event listeners
    element.addEventListener('gmp-placeselect', handlePlaceChange);
    element.addEventListener('input', handleInputChange);

    return () => {
      // Clean up event listeners
      if (element) {
        element.removeEventListener('gmp-placeselect', handlePlaceChange);
        element.removeEventListener('input', handleInputChange);
      }
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
    if (!isApiLoaded || !autocompleteRef.current) {return;}

    const element = autocompleteRef.current;

    // Note: componentRestrictions is not supported in PlaceAutocompleteElement
    // Client-side filtering will be applied in the place selection handler

    // Set fields
    if (fields.length > 0) {
      element.fields = fields;
    }

    // Set other properties
    element.placeholder = placeholder;
    element.disabled = disabled;
    element.value = inputValue;
  }, [isApiLoaded, fields, placeholder, disabled, inputValue]);

  // Show error state
  if (loadError || apiLoadError) {
    const errorMessage = loadError || apiLoadError;
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded || !isApiLoaded) {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading autocomplete...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {showIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          <MapPin className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <gmp-place-autocomplete
        ref={autocompleteRef}
        id={id}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          showIcon ? 'pl-10' : '',
          error ? 'border-red-500 focus:ring-red-500' : '',
          className,
        )}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        required={required}
      />

      {error && (
        <div className="mt-1 flex items-center space-x-1">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
}

// Export types for external use
export type { PlaceDetails, PlaceAutocompleteProps };