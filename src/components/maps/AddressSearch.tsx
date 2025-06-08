'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Navigation, Calculator } from 'lucide-react';
import {
  GoogleMap,
  Marker,
} from '@react-google-maps/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useModernGoogleMaps } from '@/contexts/ModernGoogleMapsContext';
import PlaceAutocomplete from './PlaceAutocomplete';

interface AddressSearchProps {
  onAddressSelect?: (address: {
    formatted_address: string;
    lat: number;
    lng: number;
    place_id?: string;
  }) => void;
  onDistanceCalculated?: (data: {
    distance: number;
    duration: number;
    fee: number;
  }) => void;
  defaultLocation?: { lat: number; lng: number };
  height?: string;
  showFeeCalculator?: boolean;
  baseFee?: number;
  perMileRate?: number;
}

interface RouteInfo {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  fee: number;
}

export default function AddressSearch({
  onAddressSelect,
  onDistanceCalculated,
  defaultLocation = { lat: 40.7128, lng: -74.006 },
  height = '500px',
  showFeeCalculator = true,
  baseFee = 5.99,
  perMileRate = 1.5,
}: AddressSearchProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  const [originLocation, setOriginLocation] = useState<google.maps.LatLng | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<google.maps.LatLng | null>(null);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLng | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);



  const { isLoaded, loadError } = useModernGoogleMaps();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation && isLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = new google.maps.LatLng(latitude, longitude);
          setCurrentLocation(location);
          if (map) {
            map.panTo(location);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    }
  }, [map, isLoaded]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      draggable: true,
    });
    directionsRenderer.setMap(map);
    setDirectionsService(directionsService);
    setDirectionsRenderer(directionsRenderer);
  }, []);



  const calculateFee = useCallback((distanceInMeters: number): number => {
    const distanceInMiles = distanceInMeters / 1609.34;
    return Math.round((baseFee + (distanceInMiles * perMileRate)) * 100) / 100;
  }, [baseFee, perMileRate]);

  const calculateRoute = useCallback(async () => {
    if (!directionsService || !originLocation || !destinationLocation) {
      return;
    }

    setIsCalculating(true);

    try {
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(
          {
            origin: originLocation,
            destination: destinationLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          },
        );
      });

      if (directionsRenderer) {
        directionsRenderer.setDirections(result);
      }

      const route = result.routes[0];
      if (!route) {return;}

      const leg = route.legs[0];
      if (!leg) {return;}

      const distance = leg.distance?.value || 0;
      const duration = leg.duration?.value || 0;
      const fee = calculateFee(distance);

      const routeData: RouteInfo = {
        distance: {
          text: leg.distance?.text || '0 mi',
          value: distance,
        },
        duration: {
          text: leg.duration?.text || '0 mins',
          value: duration,
        },
        fee,
      };

      setRouteInfo(routeData);

      if (onDistanceCalculated) {
        onDistanceCalculated({
          distance,
          duration,
          fee,
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [directionsService, directionsRenderer, originLocation, destinationLocation, calculateFee, onDistanceCalculated]);

  const onOriginPlaceSelect = useCallback((place: any) => {
    if (place && place.geometry && place.geometry.location) {
      const location = new google.maps.LatLng(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
      );
      setOriginLocation(location);

      if (onAddressSelect) {
        const addressData: any = {
          formatted_address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        if (place.place_id) {
          addressData.place_id = place.place_id;
        }
        onAddressSelect(addressData);
      }

      if (map) {
        map.panTo(location);
      }
    }
  }, [onAddressSelect, map]);

  const onDestinationPlaceSelect = useCallback((place: any) => {
    if (place && place.geometry && place.geometry.location) {
      const location = new google.maps.LatLng(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
      );
      setDestinationLocation(location);

      if (map) {
        const bounds = new google.maps.LatLngBounds();
        if (originLocation) {bounds.extend(originLocation);}
        bounds.extend(location);
        map.fitBounds(bounds);
      }
    }
  }, [map, originLocation]);

  const handleCurrentLocation = useCallback(() => {
    if (currentLocation && map) {
      map.panTo(currentLocation);
      map.setZoom(15);
      setOriginLocation(currentLocation);

      // Note: PlaceAutocomplete will handle the display value internally

      if (onAddressSelect) {
        onAddressSelect({
          formatted_address: 'Current Location',
          lat: currentLocation.lat(),
          lng: currentLocation.lng(),
        });
      }
    }
  }, [currentLocation, map, onAddressSelect]);

  const clearRoute = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
    setRouteInfo(null);
    setOriginLocation(null);
    setDestinationLocation(null);
    // Note: PlaceAutocomplete components will handle clearing internally
  }, [directionsRenderer]);

  // Auto-calculate route when both locations are set
  useEffect(() => {
    if (originLocation && destinationLocation) {
      calculateRoute();
    }
  }, [originLocation, destinationLocation, calculateRoute]);

  if (loadError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading Google Maps. Please check your API key configuration.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">Loading maps...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Search & Route Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Origin Address Input */}
        <div className="space-y-2">
          <Label htmlFor="origin">From (Origin)</Label>
          <div className="relative">
            <PlaceAutocomplete
              onPlaceSelect={onOriginPlaceSelect}
              placeholder="Enter pickup address..."
              className="pl-10"
              countryFilter="us"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleCurrentLocation}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Destination Address Input */}
        <div className="space-y-2">
          <Label htmlFor="destination">To (Destination)</Label>
          <div className="relative">
            <PlaceAutocomplete
              onPlaceSelect={onDestinationPlaceSelect}
              placeholder="Enter delivery address..."
              className="pl-10"
              countryFilter="us"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={calculateRoute}
            disabled={!originLocation || !destinationLocation || isCalculating}
            className="flex-1"
          >
            {isCalculating ? (
              <>
                <Calculator className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Route
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clearRoute}>
            Clear
          </Button>
        </div>

        {/* Route Information */}
        {routeInfo && showFeeCalculator && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm">Route Information</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{routeInfo.distance.text}</div>
                <div className="text-gray-500">Distance</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{routeInfo.duration.text}</div>
                <div className="text-gray-500">Duration</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">${routeInfo.fee.toFixed(2)}</div>
                <div className="text-gray-500">Delivery Fee</div>
              </div>
            </div>
            <Separator />
            <div className="text-xs text-gray-600">
              <div>Base fee: ${baseFee.toFixed(2)}</div>
              <div>Rate: ${perMileRate.toFixed(2)} per mile</div>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="relative rounded-lg overflow-hidden" style={{ height }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={currentLocation || defaultLocation}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
              ],
              disableDefaultUI: true,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {/* Origin Marker */}
            {originLocation && (
              <Marker
                position={originLocation}
                title="Origin"
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='10' cy='10' r='8' fill='%234ade80'/%3e%3ccircle cx='10' cy='10' r='3' fill='white'/%3e%3c/svg%3e",
                  scaledSize: new google.maps.Size(20, 20),
                }}
              />
            )}

            {/* Destination Marker */}
            {destinationLocation && (
              <Marker
                position={destinationLocation}
                title="Destination"
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='10' cy='10' r='8' fill='%23ef4444'/%3e%3ccircle cx='10' cy='10' r='3' fill='white'/%3e%3c/svg%3e",
                  scaledSize: new google.maps.Size(20, 20),
                }}
              />
            )}
          </GoogleMap>
        </div>
      </CardContent>
    </Card>
  );
}