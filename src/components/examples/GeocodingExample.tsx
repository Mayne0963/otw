'use client';

import React, { useState } from 'react';
import { useGeocoding, useAddressInput, useCurrentLocation } from '../../hooks/useGeocoding';
import { extractAddressComponents } from '../../lib/utils/geocoding-utils';
import type { GeocodeResult as _GeocodeResult, AddressValidationResult as _AddressValidationResult } from '../../lib/services/geocoding-service';

/**
 * Example component demonstrating geocoding functionality
 */
export default function GeocodingExample() {
  const [activeTab, setActiveTab] = useState<'geocode' | 'reverse' | 'validate' | 'input' | 'location'>('geocode');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Geocoding Service Examples</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'geocode', label: 'Geocoding' },
            { key: 'reverse', label: 'Reverse Geocoding' },
            { key: 'validate', label: 'Address Validation' },
            { key: 'input', label: 'Address Input' },
            { key: 'location', label: 'Current Location' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'geocode' && <GeocodingTab />}
          {activeTab === 'reverse' && <ReverseGeocodingTab />}
          {activeTab === 'validate' && <ValidationTab />}
          {activeTab === 'input' && <AddressInputTab />}
          {activeTab === 'location' && <CurrentLocationTab />}
        </div>
      </div>
    </div>
  );
}

/**
 * Geocoding tab component
 */
function GeocodingTab() {
  const [address, setAddress] = useState('');
  const { loading, error, result, geocode, isGeocodeResult } = useGeocoding();

  const handleGeocode = async () => {
    if (address.trim()) {
      await geocode(address);
    }
  };

  const geocodeResult = isGeocodeResult(result) ? result : null;
  const addressComponents = geocodeResult ? extractAddressComponents(geocodeResult) : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Address Geocoding</h2>
      <p className="text-gray-600">Convert an address to geographic coordinates.</p>

      <div className="flex space-x-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter an address (e.g., 1600 Amphitheatre Parkway, Mountain View, CA)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleGeocode()}
        />
        <button
          onClick={handleGeocode}
          disabled={loading || !address.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Geocoding...' : 'Geocode'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {geocodeResult && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Geocoding Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Formatted Address:</strong></p>
                <p className="text-gray-700">{geocodeResult.formatted_address}</p>
              </div>
              <div>
                <p><strong>Coordinates:</strong></p>
                <p className="text-gray-700">
                  {geocodeResult.geometry.location.lat.toFixed(6)}, {geocodeResult.geometry.location.lng.toFixed(6)}
                </p>
              </div>
              <div>
                <p><strong>Location Type:</strong></p>
                <p className="text-gray-700">{geocodeResult.geometry.location_type}</p>
              </div>
              <div>
                <p><strong>Place ID:</strong></p>
                <p className="text-gray-700 break-all">{geocodeResult.place_id}</p>
              </div>
            </div>
          </div>

          {addressComponents && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">Address Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(addressComponents).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                      <span className="ml-2 text-gray-700">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Reverse geocoding tab component
 */
function ReverseGeocodingTab() {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const { loading, error, result, reverseGeocode, isReverseGeocodeResult } = useGeocoding();

  const handleReverseGeocode = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isValidCoordinates(latitude, longitude)) {
      await reverseGeocode(latitude, longitude);
    }
  };

  const reverseResult = isReverseGeocodeResult(result) ? result : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Reverse Geocoding</h2>
      <p className="text-gray-600">Convert geographic coordinates to an address.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude (e.g., 37.4224764)"
          step="any"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude (e.g., -122.0842499)"
          step="any"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleReverseGeocode}
          disabled={loading || !lat.trim() || !lng.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Reverse Geocode'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {reverseResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800 mb-2">Reverse Geocoding Result</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p><strong>Address:</strong></p>
              <p className="text-gray-700">{reverseResult.formatted_address}</p>
            </div>
            <div>
              <p><strong>Place Types:</strong></p>
              <p className="text-gray-700">{reverseResult.types.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Address validation tab component
 */
function ValidationTab() {
  const [address, setAddress] = useState('');
  const { loading, error, result, validate, isValidationResult } = useGeocoding();

  const handleValidate = async () => {
    if (address.trim()) {
      await validate(address);
    }
  };

  const validationResult = isValidationResult(result) ? result : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Address Validation</h2>
      <p className="text-gray-600">Validate an address and check its deliverability.</p>

      <div className="flex space-x-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter an address to validate"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
        />
        <button
          onClick={handleValidate}
          disabled={loading || !address.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Validating...' : 'Validate'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {validationResult && (
        <div className="space-y-4">
          <div className={`p-4 border rounded-md ${
            validationResult.isValid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              validationResult.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              Validation Result
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Valid:</strong></p>
                <p className={validationResult.isValid ? 'text-green-700' : 'text-red-700'}>
                  {validationResult.isValid ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p><strong>Deliverable:</strong></p>
                <p className={validationResult.isDeliverable ? 'text-green-700' : 'text-red-700'}>
                  {validationResult.isDeliverable ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p><strong>Confidence:</strong></p>
                <p className="text-gray-700 capitalize">{validationResult.confidence}</p>
              </div>
            </div>
          </div>

          {validationResult.issues.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-semibold text-yellow-800 mb-2">Issues Found</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {validationResult.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.geocodeResult && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">Geocoded Address</h3>
              <p className="text-sm text-blue-700">{validationResult.geocodeResult.formatted_address}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Address input tab component
 */
function AddressInputTab() {
  const {
    inputValue,
    selectedAddress,
    validation,
    loading,
    error,
    suggestions,
    handleInputChange,
    handleAddressSelect,
    clearInput,
    isValid,
    isDeliverable,
    confidence,
    issues,
  } = useAddressInput({
    autoValidate: true,
    onAddressSelect: (result) => {
      console.log('Address selected:', result);
    },
    onValidationChange: (validation) => {
      console.log('Validation changed:', validation);
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Smart Address Input</h2>
      <p className="text-gray-600">Address input with auto-validation and suggestions.</p>

      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Start typing an address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {inputValue && (
            <button
              onClick={clearInput}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-blue-600">Validating address...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {suggestions.length > 0 && !selectedAddress && (
        <div className="border border-gray-200 rounded-md">
          <h3 className="font-semibold text-gray-900 p-3 border-b border-gray-200">Suggestions</h3>
          <div className="divide-y divide-gray-200">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleAddressSelect(suggestion.formatted_address)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-900">{suggestion.formatted_address}</p>
                <p className="text-xs text-gray-500">
                  {suggestion.geometry.location.lat.toFixed(6)}, {suggestion.geometry.location.lng.toFixed(6)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedAddress && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800 mb-2">Selected Address</h3>
          <p className="text-sm text-green-700">{selectedAddress.formatted_address}</p>
          <p className="text-xs text-green-600 mt-1">
            {selectedAddress.geometry.location.lat.toFixed(6)}, {selectedAddress.geometry.location.lng.toFixed(6)}
          </p>
        </div>
      )}

      {validation && (
        <div className={`p-4 border rounded-md ${
          isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            isValid ? 'text-green-800' : 'text-red-800'
          }`}>
            Address Validation
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Valid:</strong></p>
              <p className={isValid ? 'text-green-700' : 'text-red-700'}>
                {isValid ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p><strong>Deliverable:</strong></p>
              <p className={isDeliverable ? 'text-green-700' : 'text-red-700'}>
                {isDeliverable ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p><strong>Confidence:</strong></p>
              <p className="text-gray-700 capitalize">{confidence}</p>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-yellow-800 mb-1">Issues:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Current location tab component
 */
function CurrentLocationTab() {
  const {
    coords,
    address,
    loading,
    error,
    getCurrentLocation,
    clearLocation,
    hasLocation,
  } = useCurrentLocation();

  const [targetLat, setTargetLat] = useState('');
  const [targetLng, setTargetLng] = useState('');
  const [distance, setDistance] = useState<number | null>(null);

  const calculateDistanceToTarget = () => {
    if (coords && targetLat && targetLng) {
      const targetLatNum = parseFloat(targetLat);
      const targetLngNum = parseFloat(targetLng);

      if (isValidCoordinates(targetLatNum, targetLngNum)) {
        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          targetLatNum,
          targetLngNum,
        );
        setDistance(dist);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Current Location</h2>
      <p className="text-gray-600">Get your current location and reverse geocode it to an address.</p>

      <div className="flex space-x-2">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Getting Location...' : 'Get Current Location'}
        </button>

        {hasLocation && (
          <button
            onClick={clearLocation}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear Location
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {coords && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Current Coordinates</h3>
            <p className="text-sm text-green-700">
              Latitude: {coords.latitude.toFixed(6)}<br />
              Longitude: {coords.longitude.toFixed(6)}
            </p>
          </div>

          {address && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">Current Address</h3>
              <p className="text-sm text-blue-700">{address.formatted_address}</p>
            </div>
          )}

          {/* Distance Calculator */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-gray-800 mb-2">Distance Calculator</h3>
            <p className="text-sm text-gray-600 mb-3">Calculate distance to another location:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="number"
                value={targetLat}
                onChange={(e) => setTargetLat(e.target.value)}
                placeholder="Target Latitude"
                step="any"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={targetLng}
                onChange={(e) => setTargetLng(e.target.value)}
                placeholder="Target Longitude"
                step="any"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={calculateDistanceToTarget}
                disabled={!targetLat || !targetLng}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
            </div>

            {distance !== null && (
              <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                <p className="text-sm">
                  <strong>Distance:</strong> {distance.toFixed(2)} km ({(distance * 0.621371).toFixed(2)} miles)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}