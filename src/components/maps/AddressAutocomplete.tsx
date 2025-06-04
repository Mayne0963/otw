'use client';

import React, { useState, useRef } from "react";
import { MapPin } from "lucide-react";
import {
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import { Input } from "../ui/input";

const libraries: "places"[] = ["places"];

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onAddressSelect?: (address: {
    formatted_address: string;
    lat: number;
    lng: number;
    place_id?: string;
  }) => void;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address in Fort Wayne, IN...",
  className = "",
  onAddressSelect,
}: AddressAutocompleteProps) {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onAutocompleteLoad = (ref: google.maps.places.Autocomplete) => {
    // Configure autocomplete for Fort Wayne addresses
    ref.setOptions({
      types: ['address', 'establishment', 'geocode'],
      bounds: {
        north: 41.1306,
        south: 41.0306,
        east: -85.0372,
        west: -85.2372,
      },
      strictBounds: false,
      componentRestrictions: { country: 'us' },
    });
    setAutocomplete(ref);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formatted_address = place.formatted_address || place.name || "";
        
        // Update the input value
        onChange(formatted_address);
        
        // Call the callback if provided
        if (onAddressSelect) {
          onAddressSelect({
            formatted_address,
            lat,
            lng,
            place_id: place.place_id,
          });
        }
      }
    }
  };

  if (loadError) {
    return (
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-12 ${className}`}
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Loading..."
          className={`pl-12 ${className}`}
          disabled
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-12 ${className}`}
        />
      </Autocomplete>
    </div>
  );
}