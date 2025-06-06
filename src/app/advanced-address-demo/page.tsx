'use client';

import React, { useState } from 'react';
import AdvancedAddressAutocomplete, { PlaceDetails } from '@/components/AdvancedAddressAutocomplete';
import {
  AdvancedRideBookingExample,
  AdvancedPackageDeliveryExample,
  AdvancedGroceryDeliveryExample,
} from '@/components/examples/AdvancedOTWServiceExamples';

export default function AdvancedAddressDemoPage() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const handlePlaceSelect = (place: PlaceDetails) => {
    setSelectedPlace(place);
    console.log('Selected place:', place);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Demo', icon: '🏠' },
    { id: 'ride', label: 'Ride Booking', icon: '🚗' },
    { id: 'package', label: 'Package Delivery', icon: '📦' },
    { id: 'grocery', label: 'Grocery Delivery', icon: '🛒' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-8 h-8 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Advanced Address Autocomplete
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              Powered by Google Places API
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Experience our advanced address autocomplete component with real-time suggestions, 
            keyboard navigation, accessibility features, and seamless integration with OTW services.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 border border-gray-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Demo */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏠</span>
                  Basic Address Input
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Type an address to see real-time suggestions with keyboard navigation support.
                </p>
                
                <AdvancedAddressAutocomplete
                  label="Address"
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Start typing an address..."
                  value={inputValue}
                  onChange={setInputValue}
                  maxSuggestions={5}
                  debounceMs={300}
                  restrictToCountry={['US']}
                  className="mb-4"
                />

                {/* Features List */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white mb-3">✨ Features</h3>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Real-time address suggestions
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Keyboard navigation (↑↓ Enter Esc)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Screen reader accessibility
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Debounced API calls (300ms)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Error handling & validation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Responsive design
                    </li>
                  </ul>
                </div>
              </div>

              {/* Selected Place Details */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">📍</span>
                  Selected Address Details
                </h2>
                
                {selectedPlace ? (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <h3 className="text-sm font-semibold text-yellow-400 mb-2">Full Address</h3>
                      <p className="text-white text-sm">{selectedPlace.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                        <h4 className="text-xs font-semibold text-gray-400 mb-1">Latitude</h4>
                        <p className="text-white text-sm">{selectedPlace.lat.toFixed(6)}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                        <h4 className="text-xs font-semibold text-gray-400 mb-1">Longitude</h4>
                        <p className="text-white text-sm">{selectedPlace.lng.toFixed(6)}</p>
                      </div>
                    </div>

                    {selectedPlace.addressComponents && (
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <h3 className="text-sm font-semibold text-yellow-400 mb-3">Address Components</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {selectedPlace.addressComponents.streetNumber && (
                            <div>
                              <span className="text-gray-400">Street #:</span>
                              <span className="text-white ml-1">{selectedPlace.addressComponents.streetNumber}</span>
                            </div>
                          )}
                          {selectedPlace.addressComponents.route && (
                            <div>
                              <span className="text-gray-400">Street:</span>
                              <span className="text-white ml-1">{selectedPlace.addressComponents.route}</span>
                            </div>
                          )}
                          {selectedPlace.addressComponents.locality && (
                            <div>
                              <span className="text-gray-400">City:</span>
                              <span className="text-white ml-1">{selectedPlace.addressComponents.locality}</span>
                            </div>
                          )}
                          {selectedPlace.addressComponents.administrativeAreaLevel1 && (
                            <div>
                              <span className="text-gray-400">State:</span>
                              <span className="text-white ml-1">{selectedPlace.addressComponents.administrativeAreaLevel1}</span>
                            </div>
                          )}
                          {selectedPlace.addressComponents.postalCode && (
                            <div>
                              <span className="text-gray-400">ZIP:</span>
                              <span className="text-white ml-1">{selectedPlace.addressComponents.postalCode}</span>
                            </div>
                          )}
                          {selectedPlace.addressComponents.country && (
                            <div>
                              <span className="text-gray-400">Country:</span>
                              <span className="text-white ml-1">{selectedPlace.addressComponents.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <h3 className="text-sm font-semibold text-yellow-400 mb-2">Place ID</h3>
                      <p className="text-white text-xs font-mono break-all">{selectedPlace.placeId}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-400">Select an address to see detailed information</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ride' && (
            <div className="flex justify-center">
              <AdvancedRideBookingExample />
            </div>
          )}

          {activeTab === 'package' && (
            <div className="flex justify-center">
              <AdvancedPackageDeliveryExample />
            </div>
          )}

          {activeTab === 'grocery' && (
            <div className="flex justify-center">
              <AdvancedGroceryDeliveryExample />
            </div>
          )}
        </div>

        {/* Technical Information */}
        <div className="mt-12 bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">⚙️</span>
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">🚀 Performance</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Debounced API calls (300ms)</li>
                <li>• Minimal re-renders</li>
                <li>• Efficient suggestion caching</li>
                <li>• Lazy loading of Google Maps</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">♿ Accessibility</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• ARIA labels and roles</li>
                <li>• Keyboard navigation</li>
                <li>• Screen reader support</li>
                <li>• Focus management</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">🛡️ Error Handling</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• API failure recovery</li>
                <li>• Network error handling</li>
                <li>• User-friendly messages</li>
                <li>• Graceful degradation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">📖</span>
            How to Use
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-3">Keyboard Navigation</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs mr-2">↓</kbd>
                  <span>Navigate down suggestions</span>
                </div>
                <div className="flex items-center">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs mr-2">↑</kbd>
                  <span>Navigate up suggestions</span>
                </div>
                <div className="flex items-center">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs mr-2">Enter</kbd>
                  <span>Select highlighted suggestion</span>
                </div>
                <div className="flex items-center">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs mr-2">Esc</kbd>
                  <span>Close suggestions dropdown</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-3">Features</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>• Type at least 3 characters to see suggestions</div>
                <div>• Click or use keyboard to select addresses</div>
                <div>• Automatic validation of selected addresses</div>
                <div>• Real-time feedback and error messages</div>
                <div>• Support for different address types</div>
                <div>• Country restriction capabilities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}