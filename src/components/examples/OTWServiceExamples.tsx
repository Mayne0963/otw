import React, { useState } from 'react';
import AddressAutocomplete, { PlaceDetails } from '../AddressAutocomplete';

// Ride Booking Service Example
export const RideBookingExample: React.FC = () => {
  const [pickupAddress, setPickupAddress] = useState<PlaceDetails | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState<PlaceDetails | null>(null);

  const handleBookRide = () => {
    if (pickupAddress && dropoffAddress) {
      console.log('Booking ride:', { pickup: pickupAddress, dropoff: dropoffAddress });
      // Implement ride booking logic here
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Book a Ride</h2>

      <div className="space-y-4">
        <AddressAutocomplete
          label="Pickup Address"
          onPlaceSelect={setPickupAddress}
          placeholder="Where are you?"
        />

        <AddressAutocomplete
          label="Drop-off Address"
          onPlaceSelect={setDropoffAddress}
          placeholder="Where to?"
        />

        <button
          onClick={handleBookRide}
          disabled={!pickupAddress || !dropoffAddress}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Book Ride
        </button>
      </div>

      {pickupAddress && dropoffAddress && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-300">Route: {pickupAddress.address} → {dropoffAddress.address}</p>
        </div>
      )}
    </div>
  );
};

// Grocery Delivery Service Example
export const GroceryDeliveryExample: React.FC = () => {
  const [deliveryAddress, setDeliveryAddress] = useState<PlaceDetails | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');

  const stores = [
    'Whole Foods Market',
    'Kroger',
    'Safeway',
    'Target Grocery',
    'Walmart Grocery',
  ];

  const handleStartShopping = () => {
    if (deliveryAddress && selectedStore) {
      console.log('Starting grocery shopping:', { store: selectedStore, delivery: deliveryAddress });
      // Implement grocery shopping logic here
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Grocery Delivery</h2>

      <div className="space-y-4">
        <AddressAutocomplete
          label="Delivery Address"
          onPlaceSelect={setDeliveryAddress}
          placeholder="Where should we deliver?"
        />

        <div>
          <label className="text-sm font-semibold text-gray-300 mb-1 block">Select Store</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600"
          >
            <option value="">Choose a store...</option>
            {stores.map((store) => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStartShopping}
          disabled={!deliveryAddress || !selectedStore}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};

// Package Delivery Service Example
export const PackageDeliveryExample: React.FC = () => {
  const [senderAddress, setSenderAddress] = useState<PlaceDetails | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<PlaceDetails | null>(null);
  const [packageType, setPackageType] = useState<string>('');

  const packageTypes = [
    'Small Package (< 5 lbs)',
    'Medium Package (5-20 lbs)',
    'Large Package (20-50 lbs)',
    'Fragile Items',
    'Documents',
  ];

  const handleScheduleDelivery = () => {
    if (senderAddress && recipientAddress && packageType) {
      console.log('Scheduling package delivery:', {
        sender: senderAddress,
        recipient: recipientAddress,
        type: packageType,
      });
      // Implement package delivery scheduling logic here
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Package Delivery</h2>

      <div className="space-y-4">
        <AddressAutocomplete
          label="Pickup Address"
          onPlaceSelect={setSenderAddress}
          placeholder="Where should we pick up?"
        />

        <AddressAutocomplete
          label="Delivery Address"
          onPlaceSelect={setRecipientAddress}
          placeholder="Where should we deliver?"
        />

        <div>
          <label className="text-sm font-semibold text-gray-300 mb-1 block">Package Type</label>
          <select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600"
          >
            <option value="">Select package type...</option>
            {packageTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleScheduleDelivery}
          disabled={!senderAddress || !recipientAddress || !packageType}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Schedule Delivery
        </button>
      </div>

      {senderAddress && recipientAddress && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-300">Route: {senderAddress.address} → {recipientAddress.address}</p>
          <p className="text-xs text-gray-400 mt-1">Package: {packageType}</p>
        </div>
      )}
    </div>
  );
};

// Combined Demo Component
export const OTWServicesDemo: React.FC = () => {
  const [activeService, setActiveService] = useState<'ride' | 'grocery' | 'package'>('ride');

  const services = [
    { id: 'ride' as const, name: 'Ride Booking', icon: '🚗' },
    { id: 'grocery' as const, name: 'Grocery Delivery', icon: '🛒' },
    { id: 'package' as const, name: 'Package Delivery', icon: '📦' },
  ];

  const renderActiveService = () => {
    switch (activeService) {
      case 'ride':
        return <RideBookingExample />;
      case 'grocery':
        return <GroceryDeliveryExample />;
      case 'package':
        return <PackageDeliveryExample />;
      default:
        return <RideBookingExample />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">OTW Services</h1>

        {/* Service Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-1 flex space-x-1">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeService === service.id
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{service.icon}</span>
                {service.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Service Component */}
        <div className="flex justify-center">
          {renderActiveService()}
        </div>
      </div>
    </div>
  );
};