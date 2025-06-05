import React, { useState } from 'react';
import AddressSearch, { PlaceDetails } from './AddressSearch';

const AddressSearchStylesExample: React.FC = () => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const handlePlaceSelect = (place: PlaceDetails) => {
    setSelectedPlace(place);
    console.log('Selected place:', place);
  };

  if (!apiKey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Please add your Google Maps API key to the .env.local file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AddressSearch Styling Examples</h1>
      
      {/* Theme Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Theme Variants</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Default Theme</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Default theme..."
              theme="default"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Modern Theme</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Modern theme..."
              theme="modern"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Minimal Theme</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Minimal theme..."
              theme="minimal"
            />
          </div>
          
          <div className="space-y-2 bg-gradient-to-r from-blue-400 to-purple-500 p-4 rounded-lg">
            <label className="block text-sm font-medium text-white">Glassmorphism Theme</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Glassmorphism theme..."
              theme="glassmorphism"
            />
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <label className="block text-sm font-medium text-white mb-2">Dark Theme</label>
          <AddressSearch
            apiKey={apiKey}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Dark theme..."
            theme="dark"
          />
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Size Variants</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Small</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Small size..."
              size="sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Medium (Default)</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Medium size..."
              size="md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Large</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Large size..."
              size="lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Extra Large</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Extra large size..."
              size="xl"
            />
          </div>
        </div>
      </section>

      {/* Border Radius Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Border Radius Variants</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">No Radius</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="No border radius..."
              borderRadius="none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Large Radius</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Large border radius..."
              borderRadius="lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Full Radius</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Full border radius..."
              borderRadius="full"
            />
          </div>
        </div>
      </section>

      {/* Custom Focus Color */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Custom Focus Colors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Purple Focus</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Purple focus color..."
              focusColor="#8B5CF6"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Green Focus</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Green focus color..."
              focusColor="#10B981"
            />
          </div>
        </div>
      </section>

      {/* Icon Options */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Icon Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">With Icon (Default)</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="With location icon..."
              showIcon={true}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Without Icon</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="No location icon..."
              showIcon={false}
            />
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Custom Styles</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Custom Container & Input Styles</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Custom styled input..."
              customStyles={{
                container: 'shadow-lg',
                input: 'border-2 border-orange-300 focus:border-orange-500 focus:ring-orange-200',
                icon: 'text-orange-500'
              }}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Disabled State</label>
            <AddressSearch
              apiKey={apiKey}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Disabled input..."
              disabled={true}
            />
          </div>
        </div>
      </section>

      {/* Combined Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Combined Example</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Large Modern Theme with Custom Focus Color
          </label>
          <AddressSearch
            apiKey={apiKey}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Enter your delivery address..."
            theme="modern"
            size="lg"
            borderRadius="xl"
            focusColor="#F59E0B"
            customStyles={{
              container: 'shadow-xl',
              input: 'font-medium'
            }}
          />
        </div>
      </section>

      {/* Selected Place Display */}
      {selectedPlace && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Selected Place</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">Address Details:</h3>
            <p className="text-gray-700"><strong>Address:</strong> {selectedPlace.formatted_address}</p>
            <p className="text-gray-700"><strong>Place ID:</strong> {selectedPlace.place_id}</p>
            <p className="text-gray-700">
              <strong>Coordinates:</strong> {selectedPlace.geometry.location.lat()}, {selectedPlace.geometry.location.lng()}
            </p>
            {selectedPlace.name && (
              <p className="text-gray-700"><strong>Name:</strong> {selectedPlace.name}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AddressSearchStylesExample;