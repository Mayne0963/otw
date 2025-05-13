"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation } from 'lucide-react';
import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

const libraries: ("places")[] = ["places"];

interface MapSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  defaultLocation?: { lat: number; lng: number }
  height?: string
  showSearchBar?: boolean
}

export default function MapSearch({
  onLocationSelect,
  defaultLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  height = "400px",
  showSearchBar = true,
}: MapSearchProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null)
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLng | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = new google.maps.LatLng(latitude, longitude)
          setCurrentLocation(location)
          if (map) {
            map.panTo(location)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [map])

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map)
  }

  const onSearchBoxLoad = (ref: google.maps.places.Autocomplete) => {
    setSearchBox(ref)
  }

  const onPlacesChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      if (place && place.geometry) {
        // const selectedPlace = place; // Removed unused variable
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location
          setSelectedLocation(location)
          if (map) {
            map.panTo(location)
            map.setZoom(15)
          }
          if (onLocationSelect) {
            onLocationSelect({
              lat: location.lat(),
              lng: location.lng(),
              address: place.formatted_address || '',
            })
          }
        }
      }
    }
  }

  const handleCurrentLocation = () => {
    if (currentLocation && map) {
      map.panTo(currentLocation)
      map.setZoom(15)
      setSelectedLocation(currentLocation)
      if (onLocationSelect) {
        onLocationSelect({
          lat: currentLocation.lat(),
          lng: currentLocation.lng(),
          address: 'Current Location',
        })
      }
    }
  }

  if (loadError) {
    return <div>Error loading maps</div>
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>
  }

  return (
    <Card className="w-full overflow-hidden">
      {showSearchBar && (
        <div className="p-4 border-b">
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <Autocomplete
            onLoad={onSearchBoxLoad}
            onPlaceChanged={onPlacesChanged}
          >
            <input
              type="text"
              placeholder="Search for a location..."
              className="hidden"
            />
          </Autocomplete>
        </div>
      )}

      <div className="relative" style={{ height }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultLocation}
          zoom={13}
          onLoad={onMapLoad}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>

        <Button
          onClick={handleCurrentLocation}
          className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-100 shadow-lg"
          size="icon"
        >
          <Navigation className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  )
}
