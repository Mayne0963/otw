'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const libraries: "places"[] = ["places"];

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
  types?: string[];
  componentRestrictions?: { country?: string | string[] };
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
  strictBounds?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = "Enter an address...",
  className = "",
  disabled = false,
  showIcon = true,
  types = ['address'],
  componentRestrictions,
  bounds,
  strictBounds = false,
  value,
  onChange
}: PlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps API if not already loaded
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        existingScript.addEventListener('error', () => setLoadError('Failed to load Google Maps API'));
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setLoadError('Google Maps API key not found');
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
        };
        
        script.onerror = () => {
          setLoadError('Failed to load Google Maps API');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        setLoadError('Error loading Google Maps API');
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize PlaceAutocompleteElement when API is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return;
    }

    try {
      // Create the new PlaceAutocompleteElement
      const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
        types,
        componentRestrictions,
        bounds,
        strictBounds
      });

      // Configure the element
      autocompleteElement.placeholder = placeholder;
      if (disabled) {
        autocompleteElement.setAttribute('disabled', 'true');
      }
      if (value) {
        autocompleteElement.value = value;
      }

      // Apply styling to match the project's Input component
      autocompleteElement.className = cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        showIcon ? 'pl-10' : '',
        className
      );

      // Add event listeners
      const handlePlaceSelect = (event: any) => {
        const place = event.place;
        
        if (place && place.location) {
          const placeDetails: PlaceDetails = {
            formatted_address: place.formattedAddress || '',
            place_id: place.id || '',
            geometry: {
              location: {
                lat: () => place.location.lat(),
                lng: () => place.location.lng()
              }
            },
            address_components: place.addressComponents || [],
            name: place.displayName
          };
          
          onPlaceSelect(placeDetails);
          
          // Update external value if onChange is provided
          if (onChange) {
            onChange(place.formattedAddress || '');
          }
        }
      };

      const handleInput = (event: any) => {
        if (onChange) {
          onChange(event.target.value);
        }
      };

      autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);
      autocompleteElement.addEventListener('input', handleInput);

      // Add to container
      containerRef.current.appendChild(autocompleteElement);
      autocompleteElementRef.current = autocompleteElement;

      // Cleanup function
      return () => {
        if (autocompleteElement) {
          autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
          autocompleteElement.removeEventListener('input', handleInput);
          if (autocompleteElement.parentNode) {
            autocompleteElement.parentNode.removeChild(autocompleteElement);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing PlaceAutocompleteElement:', error);
      setLoadError('Failed to initialize autocomplete');
    }
  }, [isLoaded, onPlaceSelect, placeholder, disabled, types, componentRestrictions, bounds, strictBounds, fields, className, showIcon, onChange]);

  // Update value when prop changes
  useEffect(() => {
    if (autocompleteElementRef.current && value !== undefined) {
      autocompleteElementRef.current.value = value;
    }
  }, [value]);

  // Update disabled state when prop changes
  useEffect(() => {
    if (autocompleteElementRef.current) {
      if (disabled) {
        autocompleteElementRef.current.setAttribute('disabled', 'true');
      } else {
        autocompleteElementRef.current.removeAttribute('disabled');
      }
    }
  }, [disabled]);

  if (loadError) {
    return (
      <div className={cn('relative', className)}>
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <Input
          placeholder={`Error: ${loadError}`}
          disabled
          className={cn('h-9', showIcon ? 'pl-10' : '')}
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={cn('relative', className)}>
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <Input
          placeholder="Loading..."
          disabled
          className={cn('h-9', showIcon ? 'pl-10' : '')}
        />
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
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

// Export types for external use
export type { PlaceDetails, PlaceAutocompleteProps };