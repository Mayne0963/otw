import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error('Google Maps API key is not configured');
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        setIsLoading(false);

        if (!inputRef.current) {return;}

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['place_id', 'formatted_address', 'geometry'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          if (!place.geometry || !place.formatted_address || !place.place_id) {
            setError('Please select a valid address from the suggestions');
            return;
          }

          const placeData: PlaceDetails = {
            placeId: place.place_id,
            address: place.formatted_address,
            lat: place.geometry.location!.lat(),
            lng: place.geometry.location!.lng(),
          };

          setPlaceDetails(placeData);
          setError(null);

          if (onPlaceSelect) {
            onPlaceSelect(placeData);
          }
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initializeGoogleMaps();
  }, [onPlaceSelect]);

  if (isLoading) {
    return (
      <div className={`relative rounded-xl shadow-lg overflow-hidden ${className}`}>
        <label className="text-sm font-semibold text-gray-300 mb-1 block">{label}</label>
        <div className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative rounded-xl shadow-lg overflow-hidden ${className}`}>
        <label className="text-sm font-semibold text-gray-300 mb-1 block">{label}</label>
        <div className="w-full bg-red-900 text-red-200 rounded-lg px-4 py-2">
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl shadow-lg overflow-hidden ${className}`}>
      <label className="text-sm font-semibold text-gray-300 mb-1 block">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 border border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
      {placeDetails && (
        <div className="mt-2 p-2 bg-gray-700 rounded-md">
          <p className="text-xs text-gray-300 truncate">{placeDetails.address}</p>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
export type { PlaceDetails, AddressAutocompleteProps };