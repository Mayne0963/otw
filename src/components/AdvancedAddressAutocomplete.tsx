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
    <div className={`address-autocomplete-container relative z-[9999] ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-white/95 mb-2 tracking-wide drop-shadow-sm">
          {label}
          {required && <span className="text-otw-red-400 ml-1">*</span>}
        </label>
      )}
      <OTWPlaceAutocompleteElement
        placeholder={placeholder}
        disabled={disabled}
        onPlaceSelect={handlePlaceSelect}
        error={error}
        className="w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-0 bg-[--color-input-bg] backdrop-blur-xl border-[--color-border] text-white/95 placeholder:[--color-muted] focus:border-[--color-harvest-gold] focus:ring-2 focus:ring-[--color-harvest-gold]/40 focus:bg-[--color-input-bg] hover:border-[--color-harvest-gold]/25 hover:bg-[--color-input-bg] hover:shadow-2xl hover:shadow-[--color-harvest-gold]/15 focus:shadow-3xl focus:shadow-[--color-harvest-gold]/25 hover:scale-[1.01] focus:scale-[1.02] transition-all duration-300 ease-out font-medium text-base"
        countryFilter={restrictToCountry}
        size="md"
        showIcon={true}
      />

      {error && (
        <div className="mt-2 flex items-start space-x-2 p-3 bg-otw-red-500/10 border border-otw-red-500/20 rounded-lg backdrop-blur-sm">
          <span className="text-sm text-otw-red-300 font-medium">{error}</span>
        </div>
      )}

      {/* Success indicator with OTW styling */}
      {placeDetails && !error && (
        <div className="mt-3 p-3 bg-otw-gold-500/10 border border-otw-gold-500/20 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-otw-gold-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-white/90">Address Confirmed</p>
              <p className="text-xs text-white/70 mt-0.5">{placeDetails.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
   );
 };

 export default AdvancedAddressAutocomplete;
 export type { PlaceDetails, AdvancedAddressAutocompleteProps };