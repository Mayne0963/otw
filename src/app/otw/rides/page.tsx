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
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [selectedPickupPlace, setSelectedPickupPlace] = useState<PlaceDetails | null>(null);
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<PlaceDetails | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');

  const handleBookingSubmit = async (formData: BookingFormData) => {
    console.log('Booking submitted:', formData);

    try {
      // Here you would typically send the data to your backend API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message or redirect
      alert('Ride booking submitted successfully! We will contact you shortly to confirm your ride.');
    } catch (error) {
      console.error('Ride booking submission error:', error);
      throw new Error('Failed to submit ride booking. Please try again.');
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
                      value={pickup}
                      onPlaceSelect={(place) => {
                        if (place.placeId) {
                          setSelectedPickupPlace(place);
                          setPickupAddress(place.formattedAddress);
                          setPickup(place.displayName);
                        } else {
                          // Handle clear action
                          setSelectedPickupPlace(null);
                          setPickupAddress('');
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
                      value={destination}
                      onPlaceSelect={(place) => {
                        if (place.placeId) {
                          setSelectedDestinationPlace(place);
                          setDestinationAddress(place.formattedAddress);
                          setDestination(place.displayName);
                        } else {
                          // Handle clear action
                          setSelectedDestinationPlace(null);
                          setDestinationAddress('');
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
                  className="btn-ride w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!pickup || !destination}
                >
                  Get fare estimate →
                </button>
              </div>

              {estimatedFare && (
                <div className="mt-6 p-4 bg-[var(--color-harvest-gold)]/10 rounded-xl border border-[var(--color-harvest-gold)]/20">
                  <p className="text-[var(--color-harvest-gold)] font-semibold">Estimated fare: {estimatedFare}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {vehicleTypes.map((vehicle) => {
              const IconComponent = vehicle.icon;
              return (
                <div
                  key={vehicle.id}
                  className={`card-vehicle p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition cursor-pointer ${
                    selectedVehicle === vehicle.id
                      ? 'ring-2 ring-[var(--color-harvest-gold)] bg-[var(--color-surface-strong)]'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  {selectedVehicle === vehicle.id && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--color-harvest-gold)] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--color-onyx)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="text-[var(--color-harvest-gold)] mb-4 w-12 h-12" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--color-onyx-light)]">{vehicle.price}</div>
                      <div className="text-sm text-[var(--color-muted)]">{vehicle.eta}</div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-[var(--color-onyx-light)] mb-2">{vehicle.name}</h3>
                  <p className="text-[var(--color-muted)] text-sm mb-3">{vehicle.description}</p>
                  <div className="flex items-center text-sm text-[var(--color-muted)]">
                    <Users className="w-4 h-4 mr-1" />
                    {vehicle.capacity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Booking Form */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)]">
              <h3 className="text-2xl font-bold text-[var(--color-onyx-light)] mb-8">Complete your booking</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-[var(--color-muted)] font-medium block text-xs mb-1">When do you need this ride?</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal h-12 bg-[var(--color-surface-strong)] border-[var(--color-border)] text-[var(--color-onyx-light)] hover:border-[var(--color-harvest-gold)] transition-all">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Pick date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[var(--color-surface)] border-[var(--color-border)]">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>

                    <Select>
                      <SelectTrigger className="h-12 bg-[var(--color-surface-strong)] border-[var(--color-border)] text-[var(--color-onyx-light)]">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                        <SelectItem value="asap" className="text-[var(--color-onyx-light)]">ASAP</SelectItem>
                        <SelectItem value="morning" className="text-[var(--color-onyx-light)]">Morning (8am-12pm)</SelectItem>
                        <SelectItem value="afternoon" className="text-[var(--color-onyx-light)]">Afternoon (12pm-5pm)</SelectItem>
                        <SelectItem value="evening" className="text-[var(--color-onyx-light)]">Evening (5pm-9pm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-[var(--color-muted)] font-medium block text-xs mb-1">Contact Information</Label>
                  <Input placeholder="Your phone number" className="mt-2 h-12 input-otw" />
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-[var(--color-muted)] font-medium block text-xs mb-1">Special requests (optional)</Label>
                <Textarea
                  placeholder="Child seat, wheelchair accessible, pet-friendly, etc."
                  className="mt-2 min-h-[100px] input-otw"
                />
              </div>

              <div className="bg-gradient-to-r from-[var(--color-harvest-gold)]/10 to-[var(--color-harvest-gold)]/5 p-6 rounded-xl mb-8 border border-[var(--color-harvest-gold)]/20">
                <div className="flex items-start">
                  <Info className="w-6 h-6 text-[var(--color-harvest-gold)] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[var(--color-onyx-light)] mb-2">Fare breakdown</h4>
                    <div className="space-y-1 text-sm text-[var(--color-muted)]">
                      <div className="flex justify-between">
                        <span>Base fare</span>
                        <span>$8.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance (4.2 miles)</span>
                        <span>$4.00</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-[var(--color-border)] pt-1 mt-2">
                        <span>Total</span>
                        <span className="text-[var(--color-harvest-gold)]">$12.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 h-12 bg-[var(--color-surface-strong)] border-[var(--color-border)] text-[var(--color-onyx-light)] hover:border-[var(--color-harvest-gold)] transition-all">
                  Save for later
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="btn-ride w-full h-12 font-semibold">
                    Confirm booking
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
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
