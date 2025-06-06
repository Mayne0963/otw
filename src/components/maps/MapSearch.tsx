"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Navigation } from "lucide-react";
import PlaceAutocomplete from "./PlaceAutocomplete";

const libraries: "places"[] = ["places"];

interface MapSearchProps {
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  defaultLocation?: { lat: number; lng: number };
  height?: string;
  showSearchBar?: boolean;
}

export default function MapSearch({
  onLocationSelect,
  defaultLocation = { lat: 41.0793, lng: -85.1394 }, // Default to Fort Wayne, IN
  height = "400px",
  showSearchBar = true,
}: MapSearchProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLng | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLng | null>(null);


  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    // Set Fort Wayne as the initial center when map loads
    if (map && !currentLocation && !selectedLocation) {
      const fortWayneLocation = new google.maps.LatLng(41.0793, -85.1394);
      map.panTo(fortWayneLocation);
      map.setZoom(13);
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = new google.maps.LatLng(latitude, longitude);
          setCurrentLocation(location);
          // Only pan to user location if they haven't selected anything yet
          if (map && !selectedLocation) {
            map.panTo(location);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // If geolocation fails, ensure we stay centered on Fort Wayne
          if (map) {
            const fortWayneLocation = new google.maps.LatLng(41.0793, -85.1394);
            map.panTo(fortWayneLocation);
          }
        },
      );
    }
  }, [map, selectedLocation]);

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onPlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place && place.geometry && place.geometry.location) {
      const location = new google.maps.LatLng(
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
      setSelectedLocation(location);
      
      if (map) {
        map.panTo(location);
        map.setZoom(15);
      }
      
      if (onLocationSelect) {
        onLocationSelect({
          lat: location.lat(),
          lng: location.lng(),
          address: place.formatted_address || place.name || "",
        });
      }
    }
  }, [map, onLocationSelect]);

  const handleCurrentLocation = () => {
    if (currentLocation && map) {
      map.panTo(currentLocation);
      map.setZoom(15);
      setSelectedLocation(currentLocation);
      if (onLocationSelect) {
        onLocationSelect({
          lat: currentLocation.lat(),
          lng: currentLocation.lng(),
          address: "Current Location",
        });
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <Card className="w-full overflow-hidden">
      {showSearchBar && (
        <div className="p-4 border-b">
          <div className="relative">
            <PlaceAutocomplete
              onPlaceSelect={onPlaceSelect}
              placeholder="Enter address in Fort Wayne, IN..."
              className="pl-10 pr-12 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleCurrentLocation}
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative" style={{ height }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
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

        {!showSearchBar && (
          <Button
            onClick={handleCurrentLocation}
            className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-100 shadow-lg"
            size="icon"
            title="Use current location"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
