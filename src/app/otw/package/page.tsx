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
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { Calendar } from '../../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import {
  FaTruck,
  FaClock,
  FaMapMarkerAlt,
  FaDollarSign,
  FaShieldAlt,
  FaCalendarAlt,
  FaWeight,
  FaRuler,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaHome,
  FaBuilding,
  FaGift,
  FaSnowflake,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaStar,
  FaThumbsUp,
  FaHeart,
  FaShare,
  FaComment,
  FaEye,
  FaDownload,
  FaPrint,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import {
  CalendarIcon,
  Clock,
  MapPin,
  Package,
  CreditCard,
  Info,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Search,
  Truck,
  Timer,
  CheckCircle,
  Box,
  FileText,
  Camera,
  Scale,
  DollarSign,
  Globe,
  Smartphone,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import AdvancedAddressAutocomplete, { PlaceDetails } from '../../../components/AdvancedAddressAutocomplete';

export default function PackagePage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [packageType, setPackageType] = useState('');
  const [selectedPickupPlace, setSelectedPickupPlace] = useState<PlaceDetails | null>(null);
  const [selectedDeliveryPlace, setSelectedDeliveryPlace] = useState<PlaceDetails | null>(null);

  const deliveryServices = [
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Same-day delivery for urgent packages',
      deliveryTime: '2-4 hours',
      price: '$15.99',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      features: ['Real-time tracking', 'Photo confirmation', 'Priority handling'],
    },
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Reliable next-day delivery service',
      deliveryTime: 'Next day',
      price: '$8.99',
      icon: Truck,
      color: 'from-blue-500 to-blue-600',
      features: ['Tracking updates', 'Delivery confirmation', 'Secure handling'],
    },
    {
      id: 'scheduled',
      name: 'Scheduled Delivery',
      description: 'Choose your preferred delivery time',
      deliveryTime: '1-3 days',
      price: '$6.99',
      icon: Clock,
      color: 'from-green-500 to-green-600',
      features: ['Flexible scheduling', 'SMS notifications', 'Safe delivery'],
    },
  ];

  const packageTypes = [
    { name: 'Documents', icon: FileText, maxWeight: '2 lbs', examples: 'Letters, contracts, certificates' },
    { name: 'Small Package', icon: Box, maxWeight: '10 lbs', examples: 'Books, electronics, gifts' },
    { name: 'Medium Package', icon: Package, maxWeight: '25 lbs', examples: 'Clothing, household items' },
    { name: 'Large Package', icon: Package, maxWeight: '50 lbs', examples: 'Appliances, furniture parts' },
  ];

  return (
    <div className="min-h-screen pb-20 pt-16">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-visible bg-gradient-to-br from-otw-black via-otw-black-900 to-otw-black-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-otw-black/80 via-otw-black/60 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-otw-red-900/30 to-otw-gold-900/20 opacity-60"></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-otw-gold rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-otw-gold rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-otw-red rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 z-0 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center overflow-visible">
            {/* Left side - Hero content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-otw-gold/10 border border-otw-gold/20 rounded-full px-4 py-2 mb-6">
                <Package className="w-4 h-4 text-otw-gold mr-2" />
                <span className="text-otw-gold text-sm font-medium uppercase tracking-wide">Trusted by 10,000+ customers</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="otw-text-gradient">Package delivery</span>
                <span className="block text-white">made simple</span>
              </h1>
              <p className="text-base md:text-lg text-gray-300 mb-8 max-w-lg">
                Send packages anywhere in the city with real-time tracking, secure handling, and guaranteed delivery times.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center text-gray-300">
                  <Timer className="w-5 h-5 text-otw-gold mr-2" />
                  <span className="text-sm uppercase tracking-wide">2-hour delivery</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Shield className="w-5 h-5 text-otw-gold mr-2" />
                  <span className="text-sm uppercase tracking-wide">$1000 insurance</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-otw-gold mr-2" />
                  <span className="text-sm uppercase tracking-wide">99.9% success rate</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick quote form */}
            <div className="otw-card otw-form-container p-8 max-w-md w-full backdrop-blur-xl bg-otw-black-800/40 border border-otw-gold/20 rounded-2xl shadow-2xl overflow-visible relative z-0" style={{ overflow: 'visible', position: 'relative', zIndex: 0 }}>
              <h3 className="text-2xl font-bold text-white mb-6">Get instant quote</h3>

              <div className="space-y-6 overflow-visible relative z-0">
                <AdvancedAddressAutocomplete
                  label="Pickup Address"
                  value={pickupAddress}
                  onChange={setPickupAddress}
                  onPlaceSelect={(place) => {
                    setSelectedPickupPlace(place);
                    setPickupAddress(place.address);
                  }}
                  placeholder="Where should we pick up your package?"
                  required
                  restrictToCountry={['US']}
                  maxSuggestions={5}
                  debounceMs={300}
                />

                <AdvancedAddressAutocomplete
                  label="Delivery Address"
                  value={deliveryAddress}
                  onChange={setDeliveryAddress}
                  onPlaceSelect={(place) => {
                    setSelectedDeliveryPlace(place);
                    setDeliveryAddress(place.address);
                  }}
                  placeholder="Where should we deliver your package?"
                  required
                  restrictToCountry={['US']}
                  maxSuggestions={5}
                  debounceMs={300}
                />

                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger className="h-14 bg-otw-black-800/50 border border-otw-gold/20 text-white rounded-xl px-4 py-3 focus:border-otw-gold transition-all">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-otw-gold mr-3" />
                      <SelectValue placeholder="Package type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-otw-black-800 border border-otw-gold/20 text-white">
                    {packageTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name.toLowerCase()} className="hover:bg-otw-black-700">
                        <div className="flex items-center">
                          <type.icon className="w-4 h-4 mr-2 text-otw-gold" />
                          <span>{type.name} (up to {type.maxWeight})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-otw-gold hover:bg-otw-gold-600 text-otw-black rounded-full transition-all transform hover:scale-105 otw-button"
                  disabled={!pickupAddress || !deliveryAddress}
                >
                  Calculate price & time
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Selection Section */}
      <section className="py-20 bg-otw-black-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="otw-text-gradient">Choose your delivery speed</span>
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
              From urgent same-day delivery to scheduled delivery, we have options for every need.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {deliveryServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className={`otw-card p-6 cursor-pointer transition-all duration-500 ${
                    selectedService === service.id
                      ? 'ring-2 ring-otw-gold bg-otw-black-800/90 scale-105'
                      : 'hover:border-otw-gold/40 hover:shadow-otw-lg'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  {selectedService === service.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-otw-gold rounded-full flex items-center justify-center z-10">
                      <CheckCircle className="w-5 h-5 text-otw-black" />
                    </div>
                  )}

                  <div className="h-32 bg-gradient-to-br from-otw-black-800 to-otw-black-900 flex items-center justify-center rounded-xl mb-6">
                    <IconComponent className="w-16 h-16 text-otw-gold" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-otw-gold">{service.price}</div>
                        <div className="text-sm text-gray-400 uppercase tracking-wide">{service.deliveryTime}</div>
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4">{service.description}</p>

                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-otw-gold mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Package Types Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">What are you sending?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packageTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.name}
                    className="group otw-card p-6 text-center hover:shadow-otw-lg transition-all duration-300 cursor-pointer hover:border-otw-gold/40"
                  >
                    <div className="w-12 h-12 bg-otw-gold rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-otw-black" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1 uppercase tracking-wide">{type.name}</h4>
                    <p className="text-xs text-otw-gold mb-2 font-medium">Up to {type.maxWeight}</p>
                    <p className="text-xs text-gray-400">{type.examples}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Booking Form */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="otw-card p-8">
              <h3 className="text-2xl font-bold text-white mb-8">Package details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-gray-300 font-medium">Package dimensions</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Input placeholder="Length" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                    <Input placeholder="Width" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                    <Input placeholder="Height" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Dimensions in inches</p>
                </div>

                <div>
                  <Label className="text-gray-300 font-medium">Weight & Value</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Weight (lbs)" className="pl-10 h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl py-3 transition-all" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Value ($)" className="pl-10 h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl py-3 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-gray-300 font-medium">Pickup details</Label>
                  <div className="space-y-3 mt-2">
                    <Input placeholder="Contact name" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                    <Input placeholder="Phone number" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                    <Select>
                      <SelectTrigger className="h-12 bg-otw-black/50 border-gray-600 text-white rounded-xl px-4 py-3 focus:border-otw-gold">
                        <SelectValue placeholder="Pickup time" />
                      </SelectTrigger>
                      <SelectContent className="bg-otw-black border-gray-600">
                        <SelectItem value="asap" className="text-white hover:bg-gray-700">ASAP (within 2 hours)</SelectItem>
                        <SelectItem value="today" className="text-white hover:bg-gray-700">Later today</SelectItem>
                        <SelectItem value="tomorrow" className="text-white hover:bg-gray-700">Tomorrow</SelectItem>
                        <SelectItem value="scheduled" className="text-white hover:bg-gray-700">Schedule for later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 font-medium">Delivery details</Label>
                  <div className="space-y-3 mt-2">
                    <Input placeholder="Recipient name" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                    <Input placeholder="Recipient phone" className="h-12 bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all" />
                    <Select>
                      <SelectTrigger className="h-12 bg-otw-black/50 border-gray-600 text-white rounded-xl px-4 py-3 focus:border-otw-gold">
                        <SelectValue placeholder="Delivery instructions" />
                      </SelectTrigger>
                      <SelectContent className="bg-otw-black border-gray-600">
                        <SelectItem value="door" className="text-white hover:bg-gray-700">Leave at door</SelectItem>
                        <SelectItem value="person" className="text-white hover:bg-gray-700">Hand to person</SelectItem>
                        <SelectItem value="concierge" className="text-white hover:bg-gray-700">Leave with concierge</SelectItem>
                        <SelectItem value="signature" className="text-white hover:bg-gray-700">Signature required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-gray-300 font-medium">Special instructions (optional)</Label>
                <Textarea
                  placeholder="Any special handling instructions, access codes, or delivery notes..."
                  className="mt-2 min-h-[100px] bg-otw-black/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-otw-gold rounded-xl px-4 py-3 transition-all"
                />
              </div>

              <div className="bg-otw-gold/10 border border-otw-gold/20 p-6 rounded-xl mb-8">
                <div className="flex items-start">
                  <Info className="w-6 h-6 text-otw-gold mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-2 uppercase tracking-wide">What's included</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-otw-gold mr-2" />
                        <span>Real-time GPS tracking</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-otw-gold mr-2" />
                        <span>Photo confirmation of delivery</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-otw-gold mr-2" />
                        <span>SMS & email notifications</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-otw-gold mr-2" />
                        <span>Up to $1000 insurance coverage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 h-12 border-gray-600 text-white bg-transparent hover:bg-gray-800 rounded-xl font-semibold uppercase tracking-wide">
                  Save as template
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full h-12 bg-otw-gold hover:bg-otw-gold/90 text-otw-black font-bold rounded-xl uppercase tracking-wide">
                    Schedule pickup
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-otw-black-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-wide">
              Why choose OTW Package Delivery
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional package delivery service with advanced tracking, secure handling, and guaranteed delivery times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-gold to-otw-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-10 h-10 text-otw-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-wide">Real-time tracking</h3>
              <p className="text-gray-400">
                Track your package every step of the way with live GPS updates and notifications.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-gold to-otw-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-otw-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-wide">Secure handling</h3>
              <p className="text-gray-400">
                Professional couriers with background checks and secure vehicle storage.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-gold to-otw-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-otw-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-wide">Proof of delivery</h3>
              <p className="text-gray-400">
                Photo confirmation and digital signatures for complete peace of mind.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-otw-gold to-otw-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-10 h-10 text-otw-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-wide">City-wide coverage</h3>
              <p className="text-gray-400">
                Delivery anywhere in the metro area with competitive pricing and fast service.
              </p>
            </div>
          </div>

          {/* Pricing transparency */}
          <div className="mt-16">
            <div className="bg-otw-black/50 rounded-2xl p-8 border border-otw-gold/20">
              <h3 className="text-2xl font-bold text-white mb-6 text-center uppercase tracking-wide">Transparent pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-otw-gold mb-2">$6.99</div>
                  <div className="text-white font-medium mb-1 uppercase tracking-wide">Base rate</div>
                  <div className="text-gray-400 text-sm">First 5 miles included</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-otw-gold mb-2">$1.50</div>
                  <div className="text-white font-medium mb-1 uppercase tracking-wide">Per additional mile</div>
                  <div className="text-gray-400 text-sm">Beyond 5 mile radius</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-otw-gold mb-2">Free</div>
                  <div className="text-white font-medium mb-1 uppercase tracking-wide">Insurance</div>
                  <div className="text-gray-400 text-sm">Up to $1000 coverage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-otw-black/50 border border-otw-gold/20 rounded-full px-8 py-4">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-otw-gold rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-otw-red rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-otw-gold rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-otw-red rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
              </div>
              <span className="text-white font-medium">Trusted by 10,000+ customers for secure package delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl overflow-hidden shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Save More with Tier Membership
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like
              discounted delivery rates, priority service, and free insurance upgrades.
            </p>
            <Link href="/tier">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
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
