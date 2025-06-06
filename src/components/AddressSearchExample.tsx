import React, { useState } from 'react';
import AddressSearch, { PlaceDetails } from './AddressSearch';

const AddressSearchExample: React.FC = () => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);

  // You'll need to replace this with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log('Selected place:', place);
    setSelectedPlace(place);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Address Search</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for an address:
        </label>
        <AddressSearch
          apiKey={GOOGLE_MAPS_API_KEY}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Type an address..."
          className="shadow-sm"
        />
      </div>

      {selectedPlace && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Selected Address:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Address:</strong> {selectedPlace.formatted_address}</p>
            <p><strong>Place ID:</strong> {selectedPlace.place_id}</p>
            <p>
              <strong>Coordinates:</strong>
              {selectedPlace.geometry.location.lat()}, {selectedPlace.geometry.location.lng()}
            </p>
            {selectedPlace.name && (
              <p><strong>Name:</strong> {selectedPlace.name}</p>
            )}
          </div>

          {selectedPlace.address_components.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Address Components:</h4>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {selectedPlace.address_components.map((component, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{component.types[0]}:</span>
                    <span>{component.long_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!GOOGLE_MAPS_API_KEY && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> You need to set your Google Maps API key in the environment variable
            <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressSearchExample;