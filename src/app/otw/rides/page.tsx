'use client';

import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Calendar } from '../../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
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
  CheckCircle,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { cn } from '../../../lib/utils';
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
} from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';
import ModernPlaceAutocomplete from '../../../components/enhanced/ModernPlaceAutocomplete';
import ModernBookingForm from '../../../components/enhanced/ModernBookingForm';
import { ModernGoogleMapsProvider } from '../../../contexts/ModernGoogleMapsContext';
import type { PlaceDetails } from '../../../components/enhanced/ModernPlaceAutocomplete';
import { BookingFormData } from '../../../components/enhanced/ModernBookingForm';

export default function RidesPage() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('standard');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [selectedPickupAddress, setSelectedPickupAddress] = useState('');
  const [selectedDestinationAddress, setSelectedDestinationAddress] = useState('');
  const [selectedPickupPlace, setSelectedPickupPlace] = useState<PlaceDetails | null>(null);
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<PlaceDetails | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isLoadingFare, setIsLoadingFare] = useState(false);
  const [fareEstimateData, setFareEstimateData] = useState<any>(null);
  const [fareError, setFareError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const validateBookingForm = (formData: BookingFormData): string | null => {
    if (!formData.pickup) return 'Pickup location is required';
    if (!formData.destination) return 'Destination is required';
    if (!formData.date) return 'Date is required';
    if (!formData.time) return 'Time is required';
    if (!formData.customerName.trim()) return 'Customer name is required';
    if (!formData.customerPhone.trim()) return 'Phone number is required';
    if (!formData.customerEmail.trim()) return 'Email is required';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) return 'Please enter a valid email address';
    
    // Basic phone validation
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) return 'Please enter a valid phone number';
    
    return null;
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    console.log('Booking submitted:', formData);

    // Validate form
    const validationError = validateBookingForm(formData);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare booking data
      const bookingData = {
        pickup: {
          address: formData.pickup?.displayName || '',
          coordinates: {
            lat: formData.pickup?.location?.lat || 0,
            lng: formData.pickup?.location?.lng || 0,
          },
        },
        destination: {
          address: formData.destination?.displayName || '',
          coordinates: {
            lat: formData.destination?.location?.lat || 0,
            lng: formData.destination?.location?.lng || 0,
          },
        },
        schedule: {
          date: formData.date,
          time: formData.time
        },
        customer: {
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail
        },
        passengers: formData.passengers,
        vehicleType: formData.vehicleType,
        isRoundTrip: formData.isRoundTrip,
        notes: formData.notes,
        timestamp: new Date().toISOString()
      };

      // Submit to backend API
      const response = await fetch('/api/bookings/ride', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit booking');
      }

      // Success
      setBookingId(result.bookingId || `RD${Date.now().toString().slice(-6)}`);
      setBookingSubmitted(true);
    } catch (error) {
      console.error('Ride booking submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit ride booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFareEstimate = async () => {
    if (!selectedPickupAddress || !selectedPickupAddress.trim() || !selectedDestinationAddress || !selectedDestinationAddress.trim()) {
      setFareError('Please select both pickup and destination locations');
      return;
    }

    setIsLoadingFare(true);
    setFareError(null);
    setFareEstimateData(null);

    try {
      const response = await fetch('/api/rides/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLocation: {
            lat: selectedPickupPlace?.location?.lat || 0,
            lng: selectedPickupPlace?.location?.lng || 0,
            address: pickupAddress,
          },
          destination: {
            lat: selectedDestinationPlace?.location?.lat || 0,
            lng: selectedDestinationPlace?.location?.lng || 0,
            address: destinationAddress,
          },
          vehicleType: selectedVehicle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFareEstimateData(data.data);
        setEstimatedFare(data.data.estimatedFare.max); // Keep backward compatibility
      } else {
        setFareError(data.error || 'Failed to get fare estimate');
      }
    } catch (error) {
      console.error('Fare estimate error:', error);
      setFareError('Sorry, we couldn\'t fetch fare—please try again');
    } finally {
      setIsLoadingFare(false);
    }
  };

  const services = [
    {
      id: 'ride',
      name: 'Ride Service',
      description: 'Professional transportation service',
      price: '$15.00',
    },
    {
      id: 'delivery',
      name: 'Delivery Service',
      description: 'Package and item delivery',
      price: '$10.00',
    },
  ];

  const vehicleTypes = [
    {
      id: 'standard',
      name: 'OTW Standard',
      description: 'Affordable rides for up to 4 passengers',
      capacity: '4 passengers',
      eta: '3-5 min',
      price: '$12.50',
      icon: Car,
    },
    {
      id: 'suv',
      name: 'OTW SUV',
      description: 'Extra space for groups and luggage',
      capacity: '6 passengers',
      eta: '5-8 min',
      price: '$18.75',
      icon: Car,
    },
    {
      id: 'luxury',
      name: 'OTW Luxury',
      description: 'Premium vehicles for special occasions',
      capacity: '4 passengers',
      eta: '8-12 min',
      price: '$24.99',
      icon: Car,
    },
  ];

  return (
    <ModernGoogleMapsProvider>
      <div className="min-h-screen pb-20 pt-16">
      {/* Enhanced Hero Section with Dark Mode */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[var(--color-onyx)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-onyx)]/90 via-[var(--color-onyx)]/70 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface)]/30 to-[var(--color-onyx)]/50 opacity-60"></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-[var(--color-harvest-gold)] rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-otw-red rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[var(--color-harvest-gold)] rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-[var(--color-surface-strong)] rounded-full px-3 py-1 mb-6">
                <Zap className="w-4 h-4 text-[var(--color-harvest-gold)] mr-2" />
                <span className="text-[var(--color-harvest-gold)] text-xs font-semibold">Available 24/7</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6 leading-tight">
                Get there{' '}
                <span className="text-[var(--color-harvest-gold)]">your way</span>
              </h1>
              <p className="text-base md:text-lg text-[var(--color-onyx-light)]/90 mb-8 max-w-lg">
                Safe, reliable rides at the tap of a button. Professional drivers, transparent pricing, no surge fees.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-8">
                <div className="flex items-center text-[var(--color-muted)]">
                  <Star className="w-5 h-5 text-[var(--color-harvest-gold)] mr-2" />
                  <span className="font-semibold text-white">4.9</span>
                  <span className="ml-1">rating</span>
                </div>
                <div className="flex items-center text-[var(--color-muted)]">
                  <Shield className="w-5 h-5 text-[var(--color-harvest-gold)] mr-2" />
                  <span>Insured & licensed</span>
                </div>
                <div className="flex items-center text-[var(--color-muted)]">
                  <Users className="w-5 h-5 text-[var(--color-harvest-gold)] mr-2" />
                  <span>10,000+ rides</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick booking form */}
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-md border border-[var(--color-border)]">
              <h3 className="text-2xl font-bold text-[var(--color-onyx-light)] mb-6">Book your ride</h3>

              <div className="space-y-6">
                <div className="relative z-[9999] overflow-visible">
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Pickup</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[var(--color-harvest-gold)] rounded-full z-10"></div>
                    <ModernPlaceAutocomplete
                      label=""
                      placeholder="Enter pickup location"
                      value={selectedPickupAddress}
                      onPlaceSelect={(place) => {
                        if (place.placeId && place.formattedAddress) {
                          setSelectedPickupPlace(place);
                          setPickupAddress(place.formattedAddress);
                          setSelectedPickupAddress(place.formattedAddress);
                          setPickup(place.formattedAddress);
                        } else {
                          // Handle clear action
                          setSelectedPickupPlace(null);
                          setPickupAddress('');
                          setSelectedPickupAddress('');
                          setPickup('');
                        }
                      }}
                      className="w-full"
                      inputClassName="input-otw pl-12 h-14"
                      serviceArea={{
                        center: { lat: 41.0793, lng: -85.1394 },
                        radius: 50000,
                      }}
                      debounceMs={300}
                    />
                    <MapPin className="absolute right-4 top-3 text-[var(--color-muted)]" />
                  </div>
                </div>

                <div className="relative z-[9999] overflow-visible">
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Destination</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-otw-red rounded-full z-10"></div>
                    <ModernPlaceAutocomplete
                      label=""
                      placeholder="Where to?"
                      value={selectedDestinationAddress}
                      onPlaceSelect={(place) => {
                        if (place.placeId && place.formattedAddress) {
                          setSelectedDestinationPlace(place);
                          setDestinationAddress(place.formattedAddress);
                          setSelectedDestinationAddress(place.formattedAddress);
                          setDestination(place.formattedAddress);
                        } else {
                          // Handle clear action
                          setSelectedDestinationPlace(null);
                          setDestinationAddress('');
                          setSelectedDestinationAddress('');
                          setDestination('');
                        }
                      }}
                      className="w-full"
                      inputClassName="input-otw pl-12 h-14"
                      serviceArea={{
                        center: { lat: 41.0793, lng: -85.1394 },
                        radius: 50000,
                      }}
                      debounceMs={300}
                    />
                    <MapPin className="absolute right-4 top-3 text-[var(--color-muted)]" />
                  </div>
                </div>

                <button
                  onClick={handleFareEstimate}
                  className="btn-ride w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!selectedPickupAddress || !selectedDestinationAddress || isLoadingFare}
                >
                  {isLoadingFare ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Calculating...
                    </>
                  ) : (
                    'Get fare estimate →'
                  )}
                </button>
              </div>

              {fareError && (
                <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-400 font-semibold">{fareError}</p>
                </div>
              )}

              {fareEstimateData && (
                <div className="mt-6 p-6 bg-[var(--color-harvest-gold)]/10 rounded-xl border border-[var(--color-harvest-gold)]/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[var(--color-muted)] text-sm mb-1">Estimated Fare</p>
                      <p className="text-[var(--color-harvest-gold)] font-bold text-xl">
                        ${fareEstimateData.estimatedFare.min.toFixed(2)}–${fareEstimateData.estimatedFare.max.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[var(--color-muted)] text-sm mb-1">Distance</p>
                      <p className="text-[var(--color-onyx-light)] font-semibold">{fareEstimateData.distance.text}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[var(--color-muted)] text-sm mb-1">ETA</p>
                      <p className="text-[var(--color-onyx-light)] font-semibold">{fareEstimateData.eta}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--color-harvest-gold)]/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-muted)]">Vehicle: {fareEstimateData.vehicleInfo.name}</span>
                      <span className="text-[var(--color-muted)]">Duration: {fareEstimateData.duration.text}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Selection Section */}
      <section className="py-20 bg-[var(--color-onyx)]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--color-onyx-light)] mb-4">Choose your ride</h2>
            <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
              Select the perfect vehicle for your journey. All rides include professional drivers and transparent pricing.
            </p>
          </div>

          <h3 id="vehicle-selection-heading" className="text-xl font-semibold text-[var(--color-onyx-light)] mb-6">Choose Your Vehicle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" role="radiogroup" aria-labelledby="vehicle-selection-heading">
            {vehicleTypes.map((vehicle, index) => {
              const IconComponent = vehicle.icon;
              const isSelected = selectedVehicle === vehicle.id;
              
              return (
                <div
                  key={vehicle.id}
                  role="radio"
                  aria-checked={isSelected}
                  aria-labelledby={`vehicle-${vehicle.id}-name`}
                  aria-describedby={`vehicle-${vehicle.id}-description`}
                  tabIndex={0}
                  className={`relative card-vehicle p-6 rounded-xl bg-[var(--color-surface)] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-harvest-gold)] focus:ring-offset-2 focus:ring-offset-[var(--color-onyx)] ${
                    isSelected
                      ? 'ring-2 ring-[var(--color-harvest-gold)] bg-[var(--color-surface-strong)] shadow-lg transform scale-[1.02]'
                      : 'border-[var(--color-border)] shadow-sm hover:shadow-lg hover:scale-105 hover:border-[var(--color-harvest-gold)]/30'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedVehicle(vehicle.id);
                    }
                    // Arrow key navigation
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      const nextIndex = (index + 1) % vehicleTypes.length;
                      const nextElement = document.querySelector(`[data-vehicle-index="${nextIndex}"]`) as HTMLElement;
                      nextElement?.focus();
                    }
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prevIndex = index === 0 ? vehicleTypes.length - 1 : index - 1;
                      const prevElement = document.querySelector(`[data-vehicle-index="${prevIndex}"]`) as HTMLElement;
                      prevElement?.focus();
                    }
                  }}
                  data-vehicle-index={index}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-harvest-gold)] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                      <svg className="w-5 h-5 text-[var(--color-onyx)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="text-[var(--color-harvest-gold)] mb-4 w-12 h-12" aria-hidden="true" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--color-onyx-light)]">{vehicle.price}</div>
                      <div className="text-sm text-[var(--color-muted)]">{vehicle.eta}</div>
                    </div>
                  </div>

                  <h3 id={`vehicle-${vehicle.id}-name`} className="font-semibold text-[var(--color-onyx-light)] mb-2">{vehicle.name}</h3>
                  <p id={`vehicle-${vehicle.id}-description`} className="text-[var(--color-muted)] text-sm mb-3">{vehicle.description}</p>
                  <div className="flex items-center text-sm text-[var(--color-muted)]">
                    <Users className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span>{vehicle.capacity}</span>
                  </div>
                  
                  {/* Screen reader only selection status */}
                  <span className="sr-only">
                    {isSelected ? 'Selected' : 'Not selected'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Booking Form or Success Screen */}
          <div className="max-w-3xl mx-auto mt-16">
            {bookingSubmitted ? (
              /* Success Screen */
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)] text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-[var(--color-onyx-light)] mb-4">
                  Ride Booked Successfully!
                </h2>
                
                <p className="text-lg text-[var(--color-muted)] mb-8">
                  Your ride has been confirmed. We'll contact you shortly with driver details.
                </p>
                
                <div className="bg-[var(--color-surface-strong)] p-6 rounded-lg border border-[var(--color-border)] mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[var(--color-onyx)]/50 p-4 rounded-lg border border-[var(--color-harvest-gold)]/20">
                      <p className="text-sm text-gray-400">Booking ID</p>
                      <p className="font-mono text-lg font-semibold text-[var(--color-harvest-gold)]">#{bookingId}</p>
                    </div>
                    
                    <div className="bg-[var(--color-onyx)]/50 p-4 rounded-lg border border-[var(--color-harvest-gold)]/20">
                      <p className="text-sm text-gray-400">Estimated Pickup</p>
                      <p className="font-semibold text-[var(--color-onyx-light)]">15-20 minutes</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingId(null);
                      setSubmitError(null);
                    }}
                    variant="outline" 
                    className="flex-1 h-12 bg-[var(--color-surface-strong)] border-[var(--color-border)] text-[var(--color-onyx-light)] hover:border-[var(--color-harvest-gold)] transition-all"
                  >
                    Book Another Ride
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button className="btn-ride w-full h-12 font-semibold">
                      Back to Home
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)]">
                <h3 className="text-2xl font-bold text-[var(--color-onyx-light)] mb-8">Complete your booking</h3>
                
                <ModernBookingForm
                  onSubmit={handleBookingSubmit}
                  initialData={{
                    pickup: selectedPickupPlace,
                    destination: selectedDestinationPlace,
                    vehicleType: selectedVehicle as any
                  }}
                  serviceArea={{
                    center: { lat: 41.0793, lng: -85.1394 },
                    radius: 50000
                  }}
                  enableDestinationField={true}
                  enableDeliveryField={false}
                  className="space-y-6"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--color-onyx-light)] mb-4">
              Why riders choose OTW
            </h2>
            <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
              Experience the difference with our commitment to safety, reliability, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-harvest-gold)] to-[var(--color-harvest-gold)]/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-[var(--color-onyx)]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-onyx-light)]">Always on time</h3>
              <p className="text-[var(--color-muted)]">
                Average pickup time under 5 minutes. We respect your schedule.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-harvest-gold)] to-[var(--color-harvest-gold)]/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-[var(--color-onyx)]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-onyx-light)]">Safety first</h3>
              <p className="text-[var(--color-muted)]">
                Background-checked drivers, GPS tracking, and 24/7 support.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-harvest-gold)] to-[var(--color-harvest-gold)]/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-10 h-10 text-[var(--color-onyx)]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-onyx-light)]">Fair pricing</h3>
              <p className="text-[var(--color-muted)]">
                No surge pricing, no hidden fees. What you see is what you pay.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-harvest-gold)] to-[var(--color-harvest-gold)]/80 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-[var(--color-onyx)]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-onyx-light)]">Top rated</h3>
              <p className="text-[var(--color-muted)]">
                4.9/5 average rating from thousands of satisfied customers.
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-[var(--color-surface-strong)] rounded-full px-8 py-4 border border-[var(--color-border)]">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-[var(--color-harvest-gold)] rounded-full border-2 border-[var(--color-surface)]"></div>
                <div className="w-8 h-8 bg-[var(--color-harvest-gold)]/80 rounded-full border-2 border-[var(--color-surface)]"></div>
                <div className="w-8 h-8 bg-[var(--color-muted)] rounded-full border-2 border-[var(--color-surface)]"></div>
                <div className="w-8 h-8 bg-[var(--color-harvest-gold)] rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-xs font-bold text-[var(--color-onyx)]">+</div>
              </div>
              <span className="text-[var(--color-onyx-light)] font-medium">Join 10,000+ happy riders in Fort Wayne</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16 bg-[var(--color-onyx)]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-[var(--color-harvest-gold)] to-[var(--color-harvest-gold)]/90 rounded-2xl overflow-hidden shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-[var(--color-onyx)]">
              Save More with Tier Membership
            </h2>
            <p className="text-xl text-[var(--color-onyx)]/90 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like
              discounted rides, priority booking, and more.
            </p>
            <Link href="/tier">
              <Button size="lg" className="bg-[var(--color-onyx)] text-[var(--color-harvest-gold)] hover:bg-[var(--color-surface)] font-semibold transition-all">
                Learn About Tier Membership
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </ModernGoogleMapsProvider>
  );
}
