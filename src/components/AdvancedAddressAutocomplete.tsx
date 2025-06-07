'use client';

import React, { useState, useCallback } from 'react';
import PlaceAutocompleteElement, { PlaceDetails as ModernPlaceDetails } from '@/components/modern/PlaceAutocompleteElement';

// Legacy interface for backward compatibility
interface PlaceDetails {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
  addressComponents?: {
    streetNumber?: string;
    route?: string;
    locality?: string;
    administrativeAreaLevel1?: string;
    postalCode?: string;
    country?: string;
  };
}

interface AdvancedAddressAutocompleteProps {
  label: string;
  onPlaceSelect?: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxSuggestions?: number;
  debounceMs?: number;
  restrictToCountry?: string[];
  types?: string[];
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const AdvancedAddressAutocomplete: React.FC<AdvancedAddressAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = 'Enter address...',
  className = '',
  disabled = false,
  label = 'Address',
  showIcon = true,
  allowClear = true,
  debounceMs = 300,
  componentRestrictions,
  fields = ['place_id', 'formatted_address', 'geometry'],
}) => {
  const [error, setError] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);

  // Convert modern place details to legacy format for backward compatibility
  const handlePlaceSelect = useCallback((modernPlace: ModernPlaceDetails) => {
    const legacyPlace: PlaceDetails = {
      placeId: modernPlace.placeId,
      address: modernPlace.address,
      lat: modernPlace.lat,
      lng: modernPlace.lng,
      addressComponents: modernPlace.addressComponents
    };
    
    setPlaceDetails(legacyPlace);
    setError(null);
    
    if (onPlaceSelect) {
      onPlaceSelect(legacyPlace);
    }
  }, [onPlaceSelect]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <PlaceAutocompleteElement
        placeholder={placeholder}
        disabled={disabled}
        onPlaceSelect={handlePlaceSelect}
        error={error}
        className="w-full"
        inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        componentRestrictions={componentRestrictions}
        fields={fields}
        debounceMs={debounceMs}
      />
      
      {/* Success indicator */}
      {placeDetails && !error && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            {showIcon && (
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="text-sm text-green-700">Address selected: {placeDetails.address}</span>
          </div>
        </div>
      )}
    </div>
   );
 };

 export default AdvancedAddressAutocomplete;
 export type { PlaceDetails, AdvancedAddressAutocompleteProps };