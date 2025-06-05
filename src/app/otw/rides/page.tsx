"use client";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";

interface VehicleType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerMile: number;
  capacity: number;
  features: string[];
  estimatedArrival: string;
  available?: boolean;
}
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Car,
  CreditCard,
  Info,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Navigation,
} from "lucide-react";
import {
  FaCar,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaStar,
  FaUser,
  FaRoute,
  FaGasPump,
  FaShieldAlt,
  FaWifi,
  FaSnowflake,
  FaMusic,
  FaPhone,
  FaComments,
  FaHeart,
  FaShare,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaPrint,
} from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect } from "react";
import PlaceAutocomplete from "../../../components/maps/PlaceAutocomplete";

export default function RidesPage() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(new Date());
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number>(0);
  const [stats, setStats] = useState({
    rating: 4.9,
    totalRides: 10000,
    averagePickupTime: 5
  });
  const [fareBreakdown, setFareBreakdown] = useState({
    baseFare: 0,
    distanceFare: 0,
    total: 0
  });

  // Fetch vehicle types and stats from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle types
        const vehiclesResponse = await fetch('/api/rides?type=vehicles');
        const vehiclesData = await vehiclesResponse.json();
        if (vehiclesData.success) {
          setVehicleTypes(vehiclesData.data);
        }

        // Fetch ride stats
        const statsResponse = await fetch('/api/rides?type=stats');
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate estimated price based on distance and selected vehicle
  const calculateEstimatedPrice = (vehicle: VehicleType, calculatedDistance: number = 5) => {
    const baseFare = vehicle.basePrice;
    const distanceFare = vehicle.pricePerMile * calculatedDistance;
    const total = baseFare + distanceFare;
    
    setFareBreakdown({
      baseFare,
      distanceFare,
      total
    });
    
    return total;
  };

  // Calculate distance between pickup and destination
  const calculateDistance = async (pickup: string, dest: string) => {
    if (!pickup || !dest) return;
    
    try {
      const response = await fetch('/api/maps/distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: pickup,
          destination: dest
        })
      });
      
      const data = await response.json();
      if (data.success && data.distance) {
        setDistance(data.distance);
        if (selectedVehicle) {
          const price = calculateEstimatedPrice(selectedVehicle, data.distance);
          setEstimatedPrice(price);
        }
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    const currentDistance = distance || 5; // Default to 5 miles if no distance calculated
    setEstimatedPrice(calculateEstimatedPrice(vehicle, currentDistance));
  };

  // Effect to recalculate distance when locations change
  useEffect(() => {
    if (pickupLocation && destination) {
      calculateDistance(pickupLocation, destination);
    }
  }, [pickupLocation, destination]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-16">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url('/images/rides-hero.jpg')" }}
          ></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-otw-gold rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-otw-red rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-otw-gold rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-otw-gold/10 border border-otw-gold/20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-otw-gold mr-2" />
                <span className="text-otw-gold text-sm font-medium">Available 24/7</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                Get there
                <span className="block text-otw-gold">your way</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Safe, reliable rides at the tap of a button. Professional drivers, transparent pricing, no surge fees.
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center text-gray-300">
                  <Star className="w-5 h-5 text-otw-gold mr-2" />
                  <span className="font-semibold">{stats.rating}</span>
                  <span className="ml-1">rating</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Shield className="w-5 h-5 text-otw-gold mr-2" />
                  <span>Insured & licensed</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 text-otw-gold mr-2" />
                  <span>{stats.totalRides.toLocaleString()}+ rides</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick booking form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Book your ride</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-otw-gold rounded-full z-20"></div>
                  <PlaceAutocomplete
                    onPlaceSelect={(place) => {
                      setPickupLocation(place.formatted_address || '');
                      console.log('Selected pickup location:', place);
                    }}
                    placeholder="Pickup location in Fort Wayne, IN..."
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-otw-red rounded-full z-20"></div>
                  <PlaceAutocomplete
                    onPlaceSelect={(place) => {
                      setDestination(place.formatted_address || '');
                      console.log('Selected destination:', place);
                    }}
                    placeholder="Destination in Fort Wayne, IN..."
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-otw-gold hover:bg-otw-gold/90 text-black"
                  disabled={!pickupLocation || !destination}
                >
                  Get fare estimate
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              
              {estimatedPrice && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-otw-gold font-semibold">Estimated fare: ${estimatedPrice.toFixed(2)}</p>
                  {distance > 0 && (
                    <p className="text-gray-300 text-sm mt-1">Distance: {distance.toFixed(1)} miles</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Selection Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose your ride</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect vehicle for your journey. All rides include professional drivers and transparent pricing.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicleTypes.map((vehicle) => {
              const estimatedPrice = calculateEstimatedPrice(vehicle);
              return (
                <div
                  key={vehicle.id}
                  className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                    selectedVehicle?.id === vehicle.id
                      ? "border-otw-gold shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  {selectedVehicle?.id === vehicle.id && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-otw-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <Car className="w-12 h-12 text-gray-700" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${estimatedPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{vehicle.estimatedArrival}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                  <p className="text-gray-600 mb-3">{vehicle.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Users className="w-4 h-4 mr-1" />
                    {vehicle.capacity} passengers
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Booking Form */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Complete your booking</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-gray-700 font-medium">When do you need this ride?</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal h-12">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Pick date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                    
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP</SelectItem>
                        <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                        <SelectItem value="evening">Evening (5pm-9pm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-700 font-medium">Contact Information</Label>
                  <Input placeholder="Your phone number" className="mt-2 h-12" />
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-gray-700 font-medium">Special requests (optional)</Label>
                <Textarea
                  placeholder="Child seat, wheelchair accessible, pet-friendly, etc."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              {selectedVehicle && fareBreakdown.total > 0 && (
                <div className="bg-gradient-to-r from-otw-gold/10 to-otw-red/10 p-6 rounded-xl mb-8 border border-otw-gold/20">
                  <div className="flex items-start">
                    <Info className="w-6 h-6 text-otw-gold mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fare breakdown</h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>Base fare</span>
                          <span>${fareBreakdown.baseFare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Distance ({distance.toFixed(1)} miles)</span>
                          <span>${fareBreakdown.distanceFare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1 mt-2">
                          <span>Total</span>
                          <span>${fareBreakdown.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 h-12">
                  Save for later
                </Button>
                <Button 
                  onClick={() => {
                    if (!selectedVehicle) {
                      alert('Please select a vehicle type first');
                      return;
                    }
                    
                    if (!pickupLocation || !destination) {
                      alert('Please enter pickup and destination locations');
                      return;
                    }
                    
                    // Store service details in localStorage for checkout
                    const serviceDetails = {
                      type: 'rides' as const,
                      title: `${selectedVehicle.name} Ride`,
                      description: selectedVehicle.description,
                      estimatedPrice: fareBreakdown.total || estimatedPrice || selectedVehicle.basePrice,
                      serviceDetails: {
                        pickupLocation,
                        destination,
                        vehicleType: selectedVehicle.name,
                        passengers,
                        scheduledTime: scheduledTime?.toISOString(),
                        distance,
                        fareBreakdown,
                        estimatedArrival: selectedVehicle.estimatedArrival
                      }
                    };
                    
                    // Store basic customer info (will be completed in checkout)
                    const customerDetails = {
                      name: '',
                      phone: '',
                      email: '',
                      address: pickupLocation,
                      specialInstructions: `Pickup: ${pickupLocation}, Destination: ${destination}. Vehicle: ${selectedVehicle.name}, Passengers: ${passengers}. ${scheduledTime ? 'Scheduled for: ' + scheduledTime.toLocaleString() : 'ASAP'}`
                    };
                    
                    localStorage.setItem('otwServiceDetails', JSON.stringify(serviceDetails));
                    localStorage.setItem('otwCustomerInfo', JSON.stringify(customerDetails));
                    
                    // Navigate to checkout
                    window.location.href = '/otw/checkout?service=rides';
                  }}
                  disabled={!selectedVehicle || !pickupLocation || !destination}
                  className="flex-1 h-12 bg-otw-gold hover:bg-otw-gold/90 text-black font-semibold"
                >
                  <div className="flex items-center justify-center w-full">
                    <CreditCard className="mr-2 w-5 h-5" />
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why riders choose OTW
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the difference with our commitment to safety, reliability, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-gold to-otw-gold/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Always on time</h3>
              <p className="text-gray-400">
                Average pickup time under {stats.averagePickupTime} minutes. We respect your schedule.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-red to-otw-red/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Safety first</h3>
              <p className="text-gray-400">
                Background-checked drivers, GPS tracking, and 24/7 support.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-gold to-otw-gold/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Fair pricing</h3>
              <p className="text-gray-400">
                No surge pricing, no hidden fees. What you see is what you pay.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-red to-otw-red/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Top rated</h3>
              <p className="text-gray-400">
                {stats.rating}/5 average rating from thousands of satisfied customers.
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-8 py-4">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-otw-gold rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-otw-red rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-otw-gold rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-black">+</div>
              </div>
              <span className="text-white font-medium">Join {stats.totalRides.toLocaleString()}+ happy riders in Fort Wayne</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-otw-gold to-otw-red rounded-2xl overflow-hidden shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Save More with Tier Membership
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like
              discounted rides, priority booking, and more.
            </p>
            <Link href="/tier">
              <Button size="lg" className="bg-white text-otw-red hover:bg-gray-100 font-semibold">
                Learn About Tier Membership
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
