'use client';
import React, { useState } from 'react';
import PlaceAutocompleteElement, { PlaceDetails as ModernPlaceDetails, OTWPlaceAutocompleteElement } from '@/components/modern/PlaceAutocompleteElement';

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
    <div className={`relative ${className}`}>
      <OTWPlaceAutocompleteElement
        label={label}
        placeholder={placeholder || 'Enter your address...'}
        disabled={disabled}
        onPlaceSelect={handlePlaceSelect}
        error={error}
        className="w-full"
        countryFilter={['us']}
        fields={['place_id', 'formatted_address', 'geometry']}
        size="md"
        showIcon={true}
      />
    </div>
  );
};

export default AddressAutocomplete;
export type { PlaceDetails, AddressAutocompleteProps };