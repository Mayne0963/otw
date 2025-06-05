'use client';

import React, { useState } from 'react';
import PlaceAutocomplete, { PlaceDetails } from './PlaceAutocomplete';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { MapPin, Navigation, Building, Globe } from 'lucide-react';

export default function PlaceAutocompleteExample() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [originPlace, setOriginPlace] = useState<PlaceDetails | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceDetails | null>(null);
  const [businessPlace, setBusinessPlace] = useState<PlaceDetails | null>(null);
  const [controlledValue, setControlledValue] = useState('');

  const handlePlaceSelect = (place: PlaceDetails) => {
    setSelectedPlace(place);
    console.log('Selected place:', place);
  };

  const handleOriginSelect = (place: PlaceDetails) => {
    setOriginPlace(place);
  };

  const handleDestinationSelect = (place: PlaceDetails) => {
    setDestinationPlace(place);
  };

  const handleBusinessSelect = (place: PlaceDetails) => {
    setBusinessPlace(place);
  };

  const clearAll = () => {
    setSelectedPlace(null);
    setOriginPlace(null);
    setDestinationPlace(null);
    setBusinessPlace(null);
    setControlledValue('');
  };

  const formatCoordinates = (place: PlaceDetails) => {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">PlaceAutocomplete Component Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating the new Google Maps PlaceAutocompleteElement integration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Basic Address Search
            </CardTitle>
            <CardDescription>
              Simple address autocomplete with default settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="basic-search">Search for any address</Label>
              <PlaceAutocomplete
                onPlaceSelect={handlePlaceSelect}
                placeholder="Enter an address..."
                className="mt-1"
              />
            </div>
            {selectedPlace && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{selectedPlace.formatted_address}</p>
                <p className="text-sm text-muted-foreground">
                  Coordinates: {formatCoordinates(selectedPlace)}
                </p>
                <Badge variant="secondary">ID: {selectedPlace.place_id}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Planning Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Route Planning
            </CardTitle>
            <CardDescription>
              Origin and destination selection for directions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="origin">From</Label>
              <PlaceAutocomplete
                onPlaceSelect={handleOriginSelect}
                placeholder="Starting location..."
                className="mt-1"
                types={['address', 'establishment']}
              />
            </div>
            <div>
              <Label htmlFor="destination">To</Label>
              <PlaceAutocomplete
                onPlaceSelect={handleDestinationSelect}
                placeholder="Destination..."
                className="mt-1"
                types={['address', 'establishment']}
              />
            </div>
            {originPlace && destinationPlace && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Route ready!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  From: {originPlace.formatted_address}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  To: {destinationPlace.formatted_address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Search Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Search
            </CardTitle>
            <CardDescription>
              Search for businesses and establishments only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-search">Find a business</Label>
              <PlaceAutocomplete
                onPlaceSelect={handleBusinessSelect}
                placeholder="Search for restaurants, shops, etc..."
                className="mt-1"
                types={['establishment']}
                fields={[
                  'formattedAddress',
                  'id',
                  'location',
                  'displayName',
                  'businessStatus',
                  'rating'
                ]}
              />
            </div>
            {businessPlace && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{businessPlace.name || 'Business'}</p>
                <p className="text-sm text-muted-foreground">
                  {businessPlace.formatted_address}
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Establishment</Badge>
                  <Badge variant="secondary">{businessPlace.place_id}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controlled Input Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Controlled Input
            </CardTitle>
            <CardDescription>
              Controlled component with external value management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="controlled-search">Controlled search</Label>
              <PlaceAutocomplete
                onPlaceSelect={(place) => {
                  setControlledValue(place.formatted_address);
                  console.log('Controlled place selected:', place);
                }}
                placeholder="Type to search..."
                className="mt-1"
                value={controlledValue}
                onChange={setControlledValue}
                componentRestrictions={{ country: 'us' }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setControlledValue('New York, NY, USA')}
              >
                Set NYC
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setControlledValue('Los Angeles, CA, USA')}
              >
                Set LA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setControlledValue('')}
              >
                Clear
              </Button>
            </div>
            {controlledValue && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                Current value: <code>{controlledValue}</code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-center">
        <Button onClick={clearAll} variant="outline">
          Clear All Selections
        </Button>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Component Features</CardTitle>
          <CardDescription>
            Key features of the new PlaceAutocomplete component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Modern API</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Uses PlaceAutocompleteElement</li>
                <li>• Future-proof implementation</li>
                <li>• Better performance</li>
                <li>• Improved accessibility</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Customization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configurable place types</li>
                <li>• Country restrictions</li>
                <li>• Custom styling support</li>
                <li>• Controlled/uncontrolled modes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• TypeScript support</li>
                <li>• Tailwind CSS styling</li>
                <li>• shadcn/ui components</li>
                <li>• React hooks pattern</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Error Handling</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• API loading states</li>
                <li>• Error fallbacks</li>
                <li>• Graceful degradation</li>
                <li>• Console error logging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}