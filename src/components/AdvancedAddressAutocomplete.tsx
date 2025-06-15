'use client';

import React, { useState, useCallback } from 'react';
import PlaceAutocompleteElement, { PlaceDetails as ModernPlaceDetails, OTWPlaceAutocompleteElement } from '@/components/modern/PlaceAutocompleteElement';

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
  required = false,
  debounceMs = 300,
  restrictToCountry,
  types,
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
      addressComponents: modernPlace.addressComponents,
    };

    setPlaceDetails(legacyPlace);
    setError(null);

    if (onPlaceSelect) {
      onPlaceSelect(legacyPlace);
    }
  }, [onPlaceSelect]);

  return (
    <div className={`address-autocomplete-container relative z-[9999] overflow-visible ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-[--color-onyx] mb-3 tracking-wide drop-shadow-sm">
          {label}
          {required && <span className="text-[--color-harvest-gold] ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative z-[10] overflow-visible">
        <OTWPlaceAutocompleteElement
          placeholder={placeholder}
          disabled={disabled}
          onPlaceSelect={handlePlaceSelect}
          error={error}
          className="input-field"
          countryFilter={restrictToCountry}
          size="md"
          showIcon={true}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-start space-x-3 p-4 bg-red-900/20 border border-red-400/30 rounded-xl backdrop-blur-lg shadow-lg">
          <svg className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm text-red-200 font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* Success indicator with OTW styling */}
      {placeDetails && !error && (
        <div className="mt-3 p-4 bg-[--color-harvest-gold]/10 border border-[--color-harvest-gold]/20 rounded-xl shadow-lg backdrop-blur-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-[--color-harvest-gold] mr-3 flex-shrink-0 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[--color-onyx] drop-shadow-sm">Address Confirmed</p>
              <p className="text-xs text-[--color-muted] mt-1 leading-relaxed">{placeDetails.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
   );
 };

 export default AdvancedAddressAutocomplete;
 export type { PlaceDetails, AdvancedAddressAutocompleteProps };