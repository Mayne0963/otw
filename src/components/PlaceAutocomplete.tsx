'use client';
import { useEffect, useRef, useState } from 'react';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';

export type PlaceSuggestion = {
  formatted_address: string;
  place_id: string;
  lat: number;
  lng: number;
};

interface PlaceAutocompleteProps {
  onSelectAddress: (s: PlaceSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  // Client-side filtering options (since componentRestrictions is not supported)
  countryFilter?: string | string[];
  typeFilter?: string[];
}

export default function PlaceAutocomplete({
  onSelectAddress,
  placeholder = 'Type an address…',
  className = '',
  disabled = false,
  countryFilter,
  typeFilter,
}: PlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef = useRef<any>(null);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);

  // Use the modern Google Maps context
  const { isLoaded, loadError } = useModernGoogleMaps();

  // Initialize PlaceAutocompleteElement when API is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) {
      return;
    }

    try {
      // Create the new PlaceAutocompleteElement without deprecated properties
      const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement();

      // Configure the element
      autocompleteElement.placeholder = placeholder;
      autocompleteElement.disabled = disabled;

      // Apply custom styling
      autocompleteElement.style.setProperty('--gmp-input-border', '1px solid #ccc');
      autocompleteElement.style.setProperty('--gmp-input-border-radius', '0.375rem');
      autocompleteElement.style.setProperty('--gmp-input-padding', '0.5rem 1rem');
      autocompleteElement.style.width = '100%';

      // Store reference
      autocompleteElementRef.current = autocompleteElement;

      // Handle place selection with client-side filtering
      const handlePlaceSelect = (event: any) => {
        const place = event.place;
        if (place && place.geometry && place.geometry.location) {
          // Apply client-side country filtering if specified
          if (countryFilter && place.address_components) {
            const countries = Array.isArray(countryFilter) ? countryFilter : [countryFilter];
            const countryComponent = place.address_components.find(
              (component: any) => component.types.includes('country')
            );
            
            if (countryComponent) {
              const countryCode = countryComponent.short_name.toLowerCase();
              const countryName = countryComponent.long_name.toLowerCase();
              const isValidCountry = countries.some(filter => 
                filter.toLowerCase() === countryCode || 
                filter.toLowerCase() === countryName
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
              place.types && place.types.includes(filterType)
            );
            
            if (!hasValidType) {
              console.log('Place filtered out due to type restriction:', place.types);
              return;
            }
          }
          
          const suggestion: PlaceSuggestion = {
            formatted_address: place.formatted_address || '',
            place_id: place.place_id || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          onSelectAddress(suggestion);
          console.log('Selected place:', suggestion);
        }
      };

      // Add event listener
      autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);

      // Append to container
      containerRef.current.appendChild(autocompleteElement);

      // Cleanup function
      return () => {
        if (autocompleteElement) {
          autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
          if (autocompleteElement.parentNode) {
            autocompleteElement.parentNode.removeChild(autocompleteElement);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing PlaceAutocompleteElement:', error);
    }
  }, [isLoaded, placeholder, disabled, onSelectAddress, countryFilter, typeFilter]);

  // Update placeholder when prop changes
  useEffect(() => {
    if (autocompleteElementRef.current) {
      autocompleteElementRef.current.placeholder = placeholder;
    }
  }, [placeholder]);

  // Update disabled state when prop changes
  useEffect(() => {
    if (autocompleteElementRef.current) {
      autocompleteElementRef.current.disabled = disabled;
    }
  }, [disabled]);

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md bg-gray-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="text-gray-600">Loading address search...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (apiLoadError || loadError) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-3 border border-red-300 rounded-md bg-red-50">
          <span className="text-red-600">
            Error loading address search: {apiLoadError?.message || loadError}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="w-full"
        style={{
          minHeight: '40px',
        }}
      />
    </div>
  );
}