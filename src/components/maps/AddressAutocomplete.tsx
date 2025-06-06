'use client';

import React from 'react';
import PlaceAutocomplete from './PlaceAutocomplete';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Enter address...',
  className = '',
}: AddressAutocompleteProps) {
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place && place.formatted_address) {
      onChange(place.formatted_address);

      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
    }
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <PlaceAutocomplete
        onPlaceSelect={handlePlaceSelect}
        placeholder={placeholder}
        className={`pl-12 ${className}`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}