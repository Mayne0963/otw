'use client';

import React, { useState, useCallback } from 'react';
import AdvancedAddressAutocomplete, { PlaceDetails } from '../AdvancedAddressAutocomplete';

// Enhanced Ride Booking Service Example
export const AdvancedRideBookingExample: React.FC = () => {
  const [pickupAddress, setPickupAddress] = useState<PlaceDetails | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState<PlaceDetails | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pickupValue, setPickupValue] = useState('');
  const [dropoffValue, setDropoffValue] = useState('');

  const handleBookRide = useCallback(async () => {
    if (!pickupAddress || !dropoffAddress) {
      setBookingError('Please select both pickup and drop-off addresses');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Booking ride:', {
        pickup: pickupAddress,
        dropoff: dropoffAddress,
        distance: calculateDistance(pickupAddress, dropoffAddress),
      });

      // Reset form after successful booking
      setPickupAddress(null);
      setDropoffAddress(null);
      setPickupValue('');
      setDropoffValue('');
      alert('Ride booked successfully!');
    } catch (error) {
      setBookingError('Failed to book ride. Please try again.');
    } finally {
      setIsBooking(false);
    }
  }, [pickupAddress, dropoffAddress]);

  const calculateDistance = (pickup: PlaceDetails, dropoff: PlaceDetails): number => {
    // Simple distance calculation (in km)
    const R = 6371;
    const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
    const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
        <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        Book a Ride
      </h2>

      <div className="space-y-4">
        <AdvancedAddressAutocomplete
          label="Pickup Address"
          onPlaceSelect={setPickupAddress}
          placeholder="Where are you?"
          value={pickupValue}
          onChange={setPickupValue}
          required
          maxSuggestions={5}
          debounceMs={300}
          restrictToCountry={['US']}
          aria-describedby="pickup-help"
        />
        <div id="pickup-help" className="text-xs text-gray-400">
          Enter your current location or pickup point
        </div>

        <AdvancedAddressAutocomplete
          label="Drop-off Address"
          onPlaceSelect={setDropoffAddress}
          placeholder="Where to?"
          value={dropoffValue}
          onChange={setDropoffValue}
          required
          maxSuggestions={5}
          debounceMs={300}
          restrictToCountry={['US']}
          aria-describedby="dropoff-help"
        />
        <div id="dropoff-help" className="text-xs text-gray-400">
          Enter your destination
        </div>

        {bookingError && (
          <div className="p-3 bg-red-900 border border-red-600 rounded-lg text-red-200 text-sm" role="alert">
            {bookingError}
          </div>
        )}

        <button
          onClick={handleBookRide}
          disabled={!pickupAddress || !dropoffAddress || isBooking}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          aria-describedby="book-ride-status"
        >
          {isBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Booking...
            </>
          ) : (
            'Book Ride'
          )}
        </button>
        <div id="book-ride-status" className="sr-only">
          {isBooking ? 'Booking in progress' : 'Ready to book'}
        </div>
      </div>

      {pickupAddress && dropoffAddress && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-sm font-semibold text-white mb-2">Route Summary</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <p><span className="text-green-400">From:</span> {pickupAddress.address}</p>
            <p><span className="text-red-400">To:</span> {dropoffAddress.address}</p>
            <p><span className="text-yellow-400">Distance:</span> ~{calculateDistance(pickupAddress, dropoffAddress).toFixed(1)} km</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Package Delivery Service Example
export const AdvancedPackageDeliveryExample: React.FC = () => {
  const [senderAddress, setSenderAddress] = useState<PlaceDetails | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<PlaceDetails | null>(null);
  const [packageDetails, setPackageDetails] = useState({
    weight: '',
    dimensions: '',
    description: '',
    urgency: 'standard',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senderValue, setSenderValue] = useState('');
  const [recipientValue, setRecipientValue] = useState('');

  const handleSubmitDelivery = useCallback(async () => {
    if (!senderAddress || !recipientAddress) {return;}

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Package delivery scheduled:', {
        sender: senderAddress,
        recipient: recipientAddress,
        package: packageDetails,
      });
      alert('Package delivery scheduled successfully!');

      // Reset form
      setSenderAddress(null);
      setRecipientAddress(null);
      setSenderValue('');
      setRecipientValue('');
      setPackageDetails({ weight: '', dimensions: '', description: '', urgency: 'standard' });
    } catch (error) {
      console.error('Delivery scheduling failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [senderAddress, recipientAddress, packageDetails]);

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
        <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
        Package Delivery
      </h2>

      <div className="space-y-4">
        <AdvancedAddressAutocomplete
          label="Sender Address"
          onPlaceSelect={setSenderAddress}
          placeholder="Package pickup location"
          value={senderValue}
          onChange={setSenderValue}
          required
          maxSuggestions={5}
          types={['address']}
          restrictToCountry={['US']}
        />

        <AdvancedAddressAutocomplete
          label="Recipient Address"
          onPlaceSelect={setRecipientAddress}
          placeholder="Package delivery location"
          value={recipientValue}
          onChange={setRecipientValue}
          required
          maxSuggestions={5}
          types={['address']}
          restrictToCountry={['US']}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-1 block">Weight (kg)</label>
            <input
              type="number"
              value={packageDetails.weight}
              onChange={(e) => setPackageDetails(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="0.5"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-1 block">Urgency</label>
            <select
              value={packageDetails.urgency}
              onChange={(e) => setPackageDetails(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="overnight">Overnight</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 mb-1 block">Package Description</label>
          <textarea
            value={packageDetails.description}
            onChange={(e) => setPackageDetails(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Brief description of package contents"
            rows={3}
          />
        </div>

        <button
          onClick={handleSubmitDelivery}
          disabled={!senderAddress || !recipientAddress || isSubmitting}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Scheduling...
            </>
          ) : (
            'Schedule Delivery'
          )}
        </button>
      </div>

      {senderAddress && recipientAddress && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-sm font-semibold text-white mb-2">Delivery Summary</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <p><span className="text-blue-400">Pickup:</span> {senderAddress.addressComponents?.locality}, {senderAddress.addressComponents?.administrativeAreaLevel1}</p>
            <p><span className="text-green-400">Delivery:</span> {recipientAddress.addressComponents?.locality}, {recipientAddress.addressComponents?.administrativeAreaLevel1}</p>
            {packageDetails.weight && <p><span className="text-yellow-400">Weight:</span> {packageDetails.weight} kg</p>}
            <p><span className="text-purple-400">Priority:</span> {packageDetails.urgency}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Grocery Delivery Service Example
export const AdvancedGroceryDeliveryExample: React.FC = () => {
  const [deliveryAddress, setDeliveryAddress] = useState<PlaceDetails | null>(null);
  const [storeAddress, setStoreAddress] = useState<PlaceDetails | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [isValidating, setIsValidating] = useState(false);
  const [deliveryValue, setDeliveryValue] = useState('');
  const [storeValue, setStoreValue] = useState('');

  const validateServiceArea = useCallback(async (address: PlaceDetails) => {
    setIsValidating(true);
    try {
      // Simulate service area validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation logic - check if address is within service area
      const serviceableStates = ['IN', 'IL', 'OH', 'MI'];
      const isServiceable = serviceableStates.includes(address.addressComponents?.administrativeAreaLevel1 || '');

      if (!isServiceable) {
        alert('Sorry, we don\'t currently deliver to this area. We\'re expanding soon!');
        setDeliveryAddress(null);
        setDeliveryValue('');
      }
    } catch (error) {
      console.error('Service area validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleDeliveryAddressSelect = useCallback((place: PlaceDetails) => {
    setDeliveryAddress(place);
    validateServiceArea(place);
  }, [validateServiceArea]);

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
        <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
        </svg>
        Grocery Delivery
      </h2>

      <div className="space-y-4">
        <AdvancedAddressAutocomplete
          label="Preferred Store Location"
          onPlaceSelect={setStoreAddress}
          placeholder="Search for grocery stores near you"
          value={storeValue}
          onChange={setStoreValue}
          maxSuggestions={5}
          types={['establishment']}
          restrictToCountry={['US']}
          aria-describedby="store-help"
        />
        <div id="store-help" className="text-xs text-gray-400">
          Optional: Choose a specific store or we'll select the closest one
        </div>

        <AdvancedAddressAutocomplete
          label="Delivery Address"
          onPlaceSelect={handleDeliveryAddressSelect}
          placeholder="Where should we deliver your groceries?"
          value={deliveryValue}
          onChange={setDeliveryValue}
          required
          maxSuggestions={5}
          types={['address']}
          restrictToCountry={['US']}
          disabled={isValidating}
        />

        {isValidating && (
          <div className="flex items-center text-yellow-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
            Checking service area...
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-300 mb-1 block">Delivery Time</label>
          <select
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="asap">As soon as possible</option>
            <option value="1hour">Within 1 hour</option>
            <option value="2hours">Within 2 hours</option>
            <option value="scheduled">Schedule for later</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-300 mb-1 block">Delivery Instructions</label>
          <textarea
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Special instructions for delivery (e.g., gate code, apartment number)"
            rows={3}
          />
        </div>

        <button
          disabled={!deliveryAddress || isValidating}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Continue to Shopping
        </button>
      </div>

      {deliveryAddress && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-sm font-semibold text-white mb-2">Delivery Details</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <p><span className="text-green-400">Address:</span> {deliveryAddress.address}</p>
            <p><span className="text-blue-400">City:</span> {deliveryAddress.addressComponents?.locality}</p>
            <p><span className="text-purple-400">State:</span> {deliveryAddress.addressComponents?.administrativeAreaLevel1}</p>
            <p><span className="text-yellow-400">Timing:</span> {deliveryTime === 'asap' ? 'ASAP' : deliveryTime}</p>
            {storeAddress && <p><span className="text-orange-400">Store:</span> {storeAddress.address}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  AdvancedRideBookingExample,
  AdvancedPackageDeliveryExample,
  AdvancedGroceryDeliveryExample,
};