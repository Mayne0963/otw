'use client';
import React, { useState } from 'react';
import PlaceAutocompleteElement, { PlaceDetails as ModernPlaceDetails } from '@/components/modern/PlaceAutocompleteElement';

// Legacy interface for backward compatibility
interface PlaceDetails {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  label: string;
  onPlaceSelect?: (place: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  onPlaceSelect,
  placeholder,
  className = '',
  disabled = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Convert modern place details to legacy format
  const handlePlaceSelect = (modernPlace: ModernPlaceDetails) => {
    try {
      const legacyPlace: PlaceDetails = {
        placeId: modernPlace.placeId,
        address: modernPlace.formattedAddress,
        lat: modernPlace.location.lat,
        lng: modernPlace.location.lng,
      };

      setError(null);
      onPlaceSelect?.(legacyPlace);
    } catch (err) {
      console.error('Error processing place selection:', err);
      setError('Failed to process selected address. Please try again.');
    }
  };

  return (
    <div className={`relative rounded-xl shadow-lg overflow-hidden ${className}`}>
      <label className="text-sm font-semibold text-gray-300 mb-1 block">{label}</label>

      <PlaceAutocompleteElement
        placeholder={placeholder || 'Enter your address...'}
        disabled={disabled}
        onPlaceSelect={handlePlaceSelect}
        error={error}
        className="w-full"
        inputClassName="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        countryFilter="us"
        fields={['place_id', 'formatted_address', 'geometry']}
      />
    </div>
  );
};

export default AddressAutocomplete;
export type { PlaceDetails, AddressAutocompleteProps };