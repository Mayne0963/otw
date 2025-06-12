'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Navigation, 
  Star, 
  Users, 
  Briefcase, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Route,
  Timer,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { toast } from '../ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface RideOption {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  pricePerMile: number;
  pricePerMinute: number;
  icon: React.ReactNode;
  features: string[];
  estimatedArrival: string;
}

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface RouteInfo {
  distance: number; // in miles
  duration: number; // in minutes
  polyline: string;
}

interface FareEstimate {
  rideType: string;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgePricing: number;
  total: number;
}

const rideOptions: RideOption[] = [
  {
    id: 'economy',
    name: 'OTW Economy',
    description: 'Affordable rides for everyday trips',
    capacity: 4,
    basePrice: 3.50,
    pricePerMile: 1.25,
    pricePerMinute: 0.35,
    icon: <Car className="w-5 h-5" />,
    features: ['Up to 4 passengers', 'Standard vehicles', 'GPS tracking'],
    estimatedArrival: '3-8 min'
  },
  {
    id: 'comfort',
    name: 'OTW Comfort',
    description: 'Extra legroom and newer vehicles',
    capacity: 4,
    basePrice: 5.00,
    pricePerMile: 1.75,
    pricePerMinute: 0.45,
    icon: <Star className="w-5 h-5" />,
    features: ['Newer vehicles', 'Extra legroom', 'Top-rated drivers', 'Climate control'],
    estimatedArrival: '5-12 min'
  },
  {
    id: 'xl',
    name: 'OTW XL',
    description: 'Larger vehicles for groups',
    capacity: 6,
    basePrice: 6.50,
    pricePerMile: 2.25,
    pricePerMinute: 0.55,
    icon: <Users className="w-5 h-5" />,
    features: ['Up to 6 passengers', 'SUVs and large cars', 'Extra luggage space'],
    estimatedArrival: '8-15 min'
  },
  {
    id: 'premium',
    name: 'OTW Premium',
    description: 'Luxury vehicles and premium service',
    capacity: 4,
    basePrice: 12.00,
    pricePerMile: 3.50,
    pricePerMinute: 0.85,
    icon: <Shield className="w-5 h-5" />,
    features: ['Luxury vehicles', 'Professional drivers', 'Premium amenities', 'Priority support'],
    estimatedArrival: '10-18 min'
  },
  {
    id: 'business',
    name: 'OTW Business',
    description: 'Professional rides for business travel',
    capacity: 4,
    basePrice: 8.50,
    pricePerMile: 2.75,
    pricePerMinute: 0.65,
    icon: <Briefcase className="w-5 h-5" />,
    features: ['Business-class vehicles', 'Wi-Fi available', 'Receipt for expenses', 'Quiet ride'],
    estimatedArrival: '6-14 min'
  }
];

export default function EnhancedRideBookingForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Location state
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<LocationSuggestion | null>(null);
  const [selectedDropoff, setSelectedDropoff] = useState<LocationSuggestion | null>(null);
  
  // Ride details
  const [selectedRideType, setSelectedRideType] = useState('economy');
  const [scheduledTime, setScheduledTime] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Route and pricing
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [fareEstimates, setFareEstimates] = useState<FareEstimate[]>([]);
  const [surgePricing, setSurgePricing] = useState(1.0);
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  // Preferences
  const [quietRide, setQuietRide] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [childSeat, setChildSeat] = useState(false);
  
  // Refs for autocomplete
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      directionsService.current = new window.google.maps.DirectionsService();
    }
  }, []);

  // Handle pickup location search
  const handlePickupSearch = async (value: string) => {
    setPickupLocation(value);
    if (value.length > 2 && autocompleteService.current) {
      try {
        const request = {
          input: value,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'us' }
        };
        
        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPickupSuggestions(predictions);
            setShowPickupSuggestions(true);
          }
        });
      } catch (error) {
        console.error('Error fetching pickup suggestions:', error);
      }
    } else {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  };

  // Handle dropoff location search
  const handleDropoffSearch = async (value: string) => {
    setDropoffLocation(value);
    if (value.length > 2 && autocompleteService.current) {
      try {
        const request = {
          input: value,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'us' }
        };
        
        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setDropoffSuggestions(predictions);
            setShowDropoffSuggestions(true);
          }
        });
      } catch (error) {
        console.error('Error fetching dropoff suggestions:', error);
      }
    } else {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    }
  };

  // Select pickup location
  const selectPickupLocation = (suggestion: LocationSuggestion) => {
    setSelectedPickup(suggestion);
    setPickupLocation(suggestion.description);
    setShowPickupSuggestions(false);
    calculateRoute();
  };

  // Select dropoff location
  const selectDropoffLocation = (suggestion: LocationSuggestion) => {
    setSelectedDropoff(suggestion);
    setDropoffLocation(suggestion.description);
    setShowDropoffSuggestions(false);
    calculateRoute();
  };

  // Calculate route and fare estimates
  const calculateRoute = async () => {
    if (!selectedPickup || !selectedDropoff || !directionsService.current) return;
    
    setLoadingRoute(true);
    try {
      const request = {
        origin: selectedPickup.description,
        destination: selectedDropoff.description,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      };

      directionsService.current.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          const routeData: RouteInfo = {
            distance: leg.distance!.value * 0.000621371, // Convert meters to miles
            duration: leg.duration!.value / 60, // Convert seconds to minutes
            polyline: route.overview_polyline
          };
          
          setRouteInfo(routeData);
          calculateFareEstimates(routeData);
        }
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        title: 'Route Error',
        description: 'Unable to calculate route. Please check your locations.',
        variant: 'destructive'
      });
    } finally {
      setLoadingRoute(false);
    }
  };

  // Calculate fare estimates for all ride types
  const calculateFareEstimates = (route: RouteInfo) => {
    const estimates = rideOptions.map(option => {
      const baseFare = option.basePrice;
      const distanceFare = route.distance * option.pricePerMile;
      const timeFare = route.duration * option.pricePerMinute;
      const subtotal = baseFare + distanceFare + timeFare;
      const surgeFee = subtotal * (surgePricing - 1);
      const total = subtotal + surgeFee;
      
      return {
        rideType: option.id,
        baseFare,
        distanceFare,
        timeFare,
        surgePricing: surgeFee,
        total
      };
    });
    
    setFareEstimates(estimates);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding to get address
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  setPickupLocation(results[0].formatted_address);
                  setSelectedPickup({
                    place_id: results[0].place_id!,
                    description: results[0].formatted_address,
                    structured_formatting: {
                      main_text: 'Current Location',
                      secondary_text: results[0].formatted_address
                    }
                  });
                }
              }
            );
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Unable to get your current location',
            variant: 'destructive'
          });
        }
      );
    }
  };

  // Handle ride booking
  const handleBookRide = async () => {
    if (!user?.uid) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book a ride',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedPickup || !selectedDropoff) {
      toast({
        title: 'Locations Required',
        description: 'Please select both pickup and dropoff locations',
        variant: 'destructive'
      });
      return;
    }

    if (!contactPhone.trim()) {
      toast({
        title: 'Phone Required',
        description: 'Please provide a contact phone number',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedOption = rideOptions.find(opt => opt.id === selectedRideType);
      const fareEstimate = fareEstimates.find(est => est.rideType === selectedRideType);
      
      const rideData = {
        userId: user.uid,
        type: 'ride',
        pickupLocation: {
          address: selectedPickup.description,
          placeId: selectedPickup.place_id
        },
        dropoffLocation: {
          address: selectedDropoff.description,
          placeId: selectedDropoff.place_id
        },
        rideType: selectedRideType,
        rideOption: selectedOption,
        scheduledTime: scheduledTime || null,
        passengerCount,
        contactPhone,
        paymentMethod,
        specialRequests,
        preferences: {
          quietRide,
          petFriendly,
          wheelchairAccessible,
          childSeat
        },
        routeInfo,
        fareEstimate,
        surgePricing,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedPickup: scheduledTime || new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
      };

      const docRef = await addDoc(collection(db, 'orders'), rideData);
      
      // Reset form
      setCurrentStep(1);
      setPickupLocation('');
      setDropoffLocation('');
      setSelectedPickup(null);
      setSelectedDropoff(null);
      setRouteInfo(null);
      setFareEstimates([]);
      setScheduledTime('');
      setSpecialRequests('');
      setContactPhone('');

      toast({
        title: 'Ride Booked Successfully!',
        description: `Your ride #${docRef.id.slice(-6)} has been booked. Driver will arrive soon.`
      });

    } catch (error) {
      console.error('Error booking ride:', error);
      toast({
        title: 'Booking Error',
        description: 'Failed to book ride. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Locations', description: 'Where are you going?' },
    { number: 2, title: 'Ride Type', description: 'Choose your ride' },
    { number: 3, title: 'Details', description: 'Trip preferences' },
    { number: 4, title: 'Confirm', description: 'Review and book' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-gray-800/50 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Car className="w-6 h-6" />
              Book a Ride
            </CardTitle>
            <CardDescription className="text-gray-400">
              Safe, reliable rides with real-time tracking
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentStep >= step.number
                      ? 'bg-otw-gold text-black'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-otw-gold' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Locations */}
            {currentStep === 1 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Where to?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pickup Location */}
                  <div className="space-y-2 relative">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Pickup Location
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          ref={pickupInputRef}
                          value={pickupLocation}
                          onChange={(e) => handlePickupSearch(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white"
                          placeholder="Enter pickup address"
                        />
                        {showPickupSuggestions && pickupSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 z-50 max-h-60 overflow-y-auto">
                            {pickupSuggestions.map((suggestion) => (
                              <div
                                key={suggestion.place_id}
                                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                                onClick={() => selectPickupLocation(suggestion)}
                              >
                                <div className="text-white font-medium text-sm">
                                  {suggestion.structured_formatting.main_text}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {suggestion.structured_formatting.secondary_text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={getCurrentLocation}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div className="space-y-2 relative">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Dropoff Location
                    </Label>
                    <div className="relative">
                      <Input
                        ref={dropoffInputRef}
                        value={dropoffLocation}
                        onChange={(e) => handleDropoffSearch(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="Where are you going?"
                      />
                      {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 z-50 max-h-60 overflow-y-auto">
                          {dropoffSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.place_id}
                              className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                              onClick={() => selectDropoffLocation(suggestion)}
                            >
                              <div className="text-white font-medium text-sm">
                                {suggestion.structured_formatting.main_text}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {suggestion.structured_formatting.secondary_text}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Info */}
                  {loadingRoute && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-otw-gold"></div>
                      <span className="ml-3 text-gray-400">Calculating route...</span>
                    </div>
                  )}

                  {routeInfo && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Route className="w-4 h-4 text-otw-gold" />
                            <span className="text-white text-sm font-medium">
                              {routeInfo.distance.toFixed(1)} miles
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-otw-gold" />
                            <span className="text-white text-sm font-medium">
                              {Math.round(routeInfo.duration)} min
                            </span>
                          </div>
                        </div>
                        {surgePricing > 1 && (
                          <Badge variant="destructive" className="text-xs">
                            {surgePricing.toFixed(1)}x Surge
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Schedule Ride */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Schedule for Later (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Ride Type */}
            {currentStep === 2 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Choose Your Ride
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rideOptions.map((option) => {
                    const fareEstimate = fareEstimates.find(est => est.rideType === option.id);
                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedRideType === option.id
                            ? 'border-otw-gold bg-otw-gold/10'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedRideType(option.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-otw-gold">{option.icon}</div>
                            <div>
                              <h4 className="text-white font-medium">{option.name}</h4>
                              <p className="text-gray-400 text-sm">{option.description}</p>
                              <p className="text-gray-500 text-xs">Up to {option.capacity} passengers</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {fareEstimate ? (
                              <div className="text-otw-gold font-bold text-lg">
                                ${fareEstimate.total.toFixed(2)}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">Calculating...</div>
                            )}
                            <div className="text-gray-400 text-sm">{option.estimatedArrival}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {option.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Number of Passengers</Label>
                      <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(Number(value))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Contact Phone *</Label>
                      <Input
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="digital">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white font-medium">Ride Preferences</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="quiet"
                          checked={quietRide}
                          onCheckedChange={setQuietRide}
                        />
                        <Label htmlFor="quiet" className="text-white text-sm">
                          Quiet ride (minimal conversation)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="pet"
                          checked={petFriendly}
                          onCheckedChange={setPetFriendly}
                        />
                        <Label htmlFor="pet" className="text-white text-sm">
                          Pet-friendly vehicle
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="wheelchair"
                          checked={wheelchairAccessible}
                          onCheckedChange={setWheelchairAccessible}
                        />
                        <Label htmlFor="wheelchair" className="text-white text-sm">
                          Wheelchair accessible
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="childseat"
                          checked={childSeat}
                          onCheckedChange={setChildSeat}
                        />
                        <Label htmlFor="childseat" className="text-white text-sm">
                          Child seat required
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium">Special Requests</Label>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Any special instructions for your driver..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirm */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Trip Summary */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Trip Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                        <div>
                          <p className="text-white font-medium">Pickup</p>
                          <p className="text-gray-400 text-sm">{selectedPickup?.description}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                        <div>
                          <p className="text-white font-medium">Dropoff</p>
                          <p className="text-gray-400 text-sm">{selectedDropoff?.description}</p>
                        </div>
                      </div>
                    </div>

                    {routeInfo && (
                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Distance</span>
                          <span className="text-white">{routeInfo.distance.toFixed(1)} miles</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Estimated time</span>
                          <span className="text-white">{Math.round(routeInfo.duration)} minutes</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ride type</span>
                        <span className="text-white">{rideOptions.find(opt => opt.id === selectedRideType)?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Passengers</span>
                        <span className="text-white">{passengerCount}</span>
                      </div>
                      {scheduledTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Scheduled for</span>
                          <span className="text-white">{new Date(scheduledTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Fare Breakdown */}
                {fareEstimates.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Fare Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const fareEstimate = fareEstimates.find(est => est.rideType === selectedRideType);
                        if (!fareEstimate) return null;
                        
                        return (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Base fare</span>
                              <span className="text-white">${fareEstimate.baseFare.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Distance</span>
                              <span className="text-white">${fareEstimate.distanceFare.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Time</span>
                              <span className="text-white">${fareEstimate.timeFare.toFixed(2)}</span>
                            </div>
                            {fareEstimate.surgePricing > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Surge pricing ({surgePricing.toFixed(1)}x)</span>
                                <span className="text-white">${fareEstimate.surgePricing.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t border-gray-600 pt-3">
                              <div className="flex justify-between text-lg font-bold">
                                <span className="text-white">Total</span>
                                <span className="text-otw-gold">${fareEstimate.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={() => {
                if (currentStep === 1 && (!selectedPickup || !selectedDropoff)) {
                  toast({
                    title: 'Locations Required',
                    description: 'Please select both pickup and dropoff locations',
                    variant: 'destructive'
                  });
                  return;
                }
                if (currentStep === 2 && !selectedRideType) {
                  toast({
                    title: 'Ride Type Required',
                    description: 'Please select a ride type',
                    variant: 'destructive'
                  });
                  return;
                }
                setCurrentStep(prev => prev + 1);
              }}
              className="bg-otw-gold text-black hover:bg-otw-gold/90"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleBookRide}
              disabled={submitting}
              className="bg-otw-gold text-black hover:bg-otw-gold/90"
            >
              {submitting ? (
                'Booking Ride...'
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book Ride - ${fareEstimates.find(est => est.rideType === selectedRideType)?.total.toFixed(2) || '0.00'}
                </>
              )}
            </Button>
          )}
        </div>

        {!user && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10 mt-6">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              Please sign in to book a ride
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}