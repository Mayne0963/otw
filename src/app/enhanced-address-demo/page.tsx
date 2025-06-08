'use client';

import React, { useState } from 'react';
import { OTWAddressSearch, AddressSearchProps, PlaceDetails } from '@/components/AddressSearch';
import { OTWPlaceAutocompleteElement } from '@/components/modern/PlaceAutocompleteElement';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import AdvancedAddressAutocomplete from '@/components/AdvancedAddressAutocomplete';
import { MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface DemoState {
  selectedPlace: PlaceDetails | null;
  inputValue: string;
  error: string | null;
}

const EnhancedAddressDemo: React.FC = () => {
  const [demoStates, setDemoStates] = useState<Record<string, DemoState>>({
    basic: { selectedPlace: null, inputValue: '', error: null },
    modern: { selectedPlace: null, inputValue: '', error: null },
    advanced: { selectedPlace: null, inputValue: '', error: null },
    legacy: { selectedPlace: null, inputValue: '', error: null }
  });

  const updateDemoState = (demo: string, updates: Partial<DemoState>) => {
    setDemoStates(prev => ({
      ...prev,
      [demo]: { ...prev[demo], ...updates }
    }));
  };

  const handlePlaceSelect = (demo: string) => (place: PlaceDetails) => {
    console.log(`${demo} place selected:`, place);
    updateDemoState(demo, { selectedPlace: place, error: null });
  };

  const handleInputChange = (demo: string) => (value: string) => {
    updateDemoState(demo, { inputValue: value });
  };

  const PlaceDetailsCard: React.FC<{ place: PlaceDetails; title: string }> = ({ place, title }) => (
    <div className="mt-4 p-4 bg-gradient-to-r from-otw-gold-50 to-otw-gold-100 border border-otw-gold-200 rounded-xl shadow-sm">
      <div className="flex items-start space-x-3">
        <CheckCircleIcon className="w-6 h-6 text-otw-gold-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-otw-black-800 mb-2">{title}</h4>
          <div className="space-y-1 text-xs text-otw-black-600">
            <p><span className="font-medium">Address:</span> {place.formattedAddress}</p>
            <p><span className="font-medium">Place ID:</span> {place.placeId}</p>
            <p><span className="font-medium">Coordinates:</span> {place.location.lat.toFixed(6)}, {place.location.lng.toFixed(6)}</p>
            {place.displayName && (
              <p><span className="font-medium">Display Name:</span> {place.displayName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black-50 via-white to-otw-gold-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-otw-black-900 via-otw-black-800 to-otw-black-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-otw-gold-500 rounded-full">
                <MapPinIcon className="w-8 h-8 text-otw-black-900" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-otw-gold-400 to-otw-gold-600 bg-clip-text text-transparent">
              Enhanced Address Search Components
            </h1>
            <p className="text-xl text-otw-black-300 max-w-3xl mx-auto">
              Showcase of OTW-branded address search components with Google Places API integration
            </p>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* OTW Address Search */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-otw-black-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-otw-black-900 mb-2">OTW Address Search</h2>
              <p className="text-otw-black-600">Enhanced address search with OTW branding and multiple theme options</p>
            </div>
            
            <div className="space-y-6">
              <OTWAddressSearch
                label="Delivery Address"
                placeholder="Enter your delivery address..."
                onPlaceSelect={handlePlaceSelect('basic')}
                onInputChange={handleInputChange('basic')}
                required
                showIcon
                size="md"
              />
              
              {demoStates.basic.selectedPlace && (
                <PlaceDetailsCard 
                  place={demoStates.basic.selectedPlace} 
                  title="Selected Address Details" 
                />
              )}
            </div>
          </div>

          {/* Modern Place Autocomplete Element */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-otw-black-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-otw-black-900 mb-2">Modern Place Autocomplete</h2>
              <p className="text-otw-black-600">Direct Google Places API integration with OTW styling</p>
            </div>
            
            <div className="space-y-6">
              <OTWPlaceAutocompleteElement
                label="Business Address"
                placeholder="Search for business address..."
                onPlaceSelect={handlePlaceSelect('modern')}
                onInputChange={handleInputChange('modern')}
                required
                size="lg"
                showIcon
                countryFilter={['us', 'ca']}
                typeFilter={['establishment', 'geocode']}
              />
              
              {demoStates.modern.selectedPlace && (
                <PlaceDetailsCard 
                  place={demoStates.modern.selectedPlace} 
                  title="Business Address Details" 
                />
              )}
            </div>
          </div>

          {/* Advanced Address Autocomplete */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-otw-black-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-otw-black-900 mb-2">Advanced Autocomplete</h2>
              <p className="text-otw-black-600">Feature-rich autocomplete with legacy compatibility</p>
            </div>
            
            <div className="space-y-6">
              <AdvancedAddressAutocomplete
                label="Event Venue"
                placeholder="Find event venue..."
                onPlaceSelect={(place) => {
                  // Convert legacy format to modern format for display
                  const modernPlace: PlaceDetails = {
                    placeId: place.placeId,
                    formattedAddress: place.address,
                    displayName: place.address,
                    location: { lat: place.lat, lng: place.lng },
                    addressComponents: [],
                    types: []
                  };
                  handlePlaceSelect('advanced')(modernPlace);
                }}
                restrictToCountry={['us']}
                className="w-full"
              />
              
              {demoStates.advanced.selectedPlace && (
                <PlaceDetailsCard 
                  place={demoStates.advanced.selectedPlace} 
                  title="Event Venue Details" 
                />
              )}
            </div>
          </div>

          {/* Legacy Address Autocomplete */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-otw-black-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-otw-black-900 mb-2">Legacy Autocomplete</h2>
              <p className="text-otw-black-600">Backward-compatible component with modern styling</p>
            </div>
            
            <div className="space-y-6">
              <AddressAutocomplete
                label="Pickup Location"
                placeholder="Enter pickup location..."
                onPlaceSelect={(place) => {
                  // Convert legacy format to modern format for display
                  const modernPlace: PlaceDetails = {
                    placeId: place.placeId,
                    formattedAddress: place.address,
                    displayName: place.address,
                    location: { lat: place.lat, lng: place.lng },
                    addressComponents: [],
                    types: []
                  };
                  handlePlaceSelect('legacy')(modernPlace);
                }}
                className="w-full"
              />
              
              {demoStates.legacy.selectedPlace && (
                <PlaceDetailsCard 
                  place={demoStates.legacy.selectedPlace} 
                  title="Pickup Location Details" 
                />
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-otw-black-900 mb-4">Enhanced Features</h2>
            <p className="text-lg text-otw-black-600 max-w-3xl mx-auto">
              All components feature OTW branding, improved accessibility, and modern UX patterns
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-otw-gold-50 to-otw-gold-100 rounded-xl p-6 border border-otw-gold-200">
              <div className="w-12 h-12 bg-otw-gold-500 rounded-lg flex items-center justify-center mb-4">
                <MapPinIcon className="w-6 h-6 text-otw-black-900" />
              </div>
              <h3 className="text-lg font-semibold text-otw-black-900 mb-2">OTW Branding</h3>
              <p className="text-otw-black-600">Consistent brand colors, typography, and visual elements</p>
            </div>
            
            <div className="bg-gradient-to-br from-otw-red-50 to-otw-red-100 rounded-xl p-6 border border-otw-red-200">
              <div className="w-12 h-12 bg-otw-red-500 rounded-lg flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-otw-black-900 mb-2">Accessibility</h3>
              <p className="text-otw-black-600">ARIA labels, keyboard navigation, and screen reader support</p>
            </div>
            
            <div className="bg-gradient-to-br from-otw-black-50 to-otw-black-100 rounded-xl p-6 border border-otw-black-200">
              <div className="w-12 h-12 bg-otw-black-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-otw-black-900 mb-2">Performance</h3>
              <p className="text-otw-black-600">Optimized API calls, debouncing, and efficient rendering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAddressDemo;