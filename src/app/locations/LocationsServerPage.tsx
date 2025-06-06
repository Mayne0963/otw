'use client';

import { useState, useEffect } from 'react';
import LocationMap from '../../components/locations/LocationMap';

import type { Location } from '../../types/location';

type LocationsClientPageProps = {
  locations: Location[]
}

export default function LocationsClientPage({ locations }: LocationsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 }); // Default to LA
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const states = [...new Set(locations.map((location) => location.state))].sort();

  useEffect(() => {
    let filtered = [...locations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (location) =>
          location.name.toLowerCase().includes(query) ||
          location.address.toLowerCase().includes(query) ||
          location.city.toLowerCase().includes(query) ||
          location.state.toLowerCase().includes(query) ||
          location.zipCode.toLowerCase().includes(query),
      );
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter((location) => location.state === selectedState);
    }

    setFilteredLocations(filtered);

    if (filtered.length > 0 && (searchQuery || selectedState !== 'all') && filtered[0]?.coordinates) {
      setMapCenter({ lat: filtered[0].coordinates.lat, lng: filtered[0].coordinates.lng });
      setMapZoom(10);
    } else {
      setMapCenter({ lat: 34.0522, lng: -118.2437 });
      setMapZoom(5);
    }
  }, [searchQuery, selectedState, locations]);

  // Handle location selection for the map
  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter({ lat: location.coordinates.lat, lng: location.coordinates.lng });
    setMapZoom(14);
  };

  // Return the JSX for the locations page
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Locations</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search locations..."
          className="px-4 py-2 border rounded-md w-full md:w-1/2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-md w-full md:w-1/4"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <option value="all">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className={`border rounded-lg overflow-hidden shadow-lg cursor-pointer ${selectedLocation?.id === location.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleMarkerClick(location)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{location.name}</h2>
                  <p className="text-gray-600 mb-4">
                    {location.address}, {location.city}, {location.state} {location.zipCode}
                  </p>
                  <p className="font-medium mb-2">Phone: {location.phone}</p>

                  <div className="mb-4">
                    <h3 className="font-bold mb-1">Hours:</h3>
                    <ul>
                      {location.hours.map((hour, index) => (
                        <li key={index}>
                          <span className="font-medium">{hour.day}:</span> {hour.hours}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold mb-1">Features:</h3>
                    <div className="flex flex-wrap gap-2">
                      {location.features.map((feature, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {location.notes && (
                    <p className="italic text-gray-600">{location.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[600px] lg:h-auto">
          <LocationMap
            locations={filteredLocations}
            center={mapCenter}
            zoom={mapZoom}
            selectedLocation={selectedLocation}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xl">No locations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
