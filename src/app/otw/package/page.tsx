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

export default function PackagePage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [packageType, setPackageType] = useState('');

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
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url('/images/package-hero.jpg')" }}
          ></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-otw-gold rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <Package className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-blue-400 text-sm font-medium">Trusted by 10,000+ customers</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                Package delivery
                <span className="block text-blue-400">made simple</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Send packages anywhere in the city with real-time tracking, secure handling, and guaranteed delivery times.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center text-gray-300">
                  <Timer className="w-5 h-5 text-blue-400 mr-2" />
                  <span>2-hour delivery</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Shield className="w-5 h-5 text-blue-400 mr-2" />
                  <span>$1000 insurance</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                  <span>99.9% success rate</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick quote form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Get instant quote</h3>

              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Pickup address"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>

                <Select value={packageType} onValueChange={setPackageType}>
                  <SelectTrigger className="h-14 bg-white/10 border-white/20 text-white">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <SelectValue placeholder="Package type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {packageTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name.toLowerCase()}>
                        <div className="flex items-center">
                          <type.icon className="w-4 h-4 mr-2" />
                          <span>{type.name} (up to {type.maxWeight})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white"
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose your delivery speed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From urgent same-day delivery to scheduled delivery, we have options for every need.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {deliveryServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className={`relative bg-white rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                    selectedService === service.id
                      ? 'border-blue-500 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  {selectedService === service.id && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-10">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={`h-32 bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                    <IconComponent className="w-16 h-16 text-white" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{service.price}</div>
                        <div className="text-sm text-gray-500">{service.deliveryTime}</div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{service.description}</p>

                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
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
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What are you sending?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packageTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.name}
                    className="group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{type.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">Up to {type.maxWeight}</p>
                    <p className="text-xs text-gray-400">{type.examples}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Booking Form */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Package details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-gray-700 font-medium">Package dimensions</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Input placeholder="Length" className="h-12" />
                    <Input placeholder="Width" className="h-12" />
                    <Input placeholder="Height" className="h-12" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Dimensions in inches</p>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Weight & Value</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Weight (lbs)" className="pl-10 h-12" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Value ($)" className="pl-10 h-12" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-gray-700 font-medium">Pickup details</Label>
                  <div className="space-y-3 mt-2">
                    <Input placeholder="Contact name" className="h-12" />
                    <Input placeholder="Phone number" className="h-12" />
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Pickup time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP (within 2 hours)</SelectItem>
                        <SelectItem value="today">Later today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="scheduled">Schedule for later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Delivery details</Label>
                  <div className="space-y-3 mt-2">
                    <Input placeholder="Recipient name" className="h-12" />
                    <Input placeholder="Recipient phone" className="h-12" />
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Delivery instructions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="door">Leave at door</SelectItem>
                        <SelectItem value="person">Hand to person</SelectItem>
                        <SelectItem value="concierge">Leave with concierge</SelectItem>
                        <SelectItem value="signature">Signature required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-gray-700 font-medium">Special instructions (optional)</Label>
                <Textarea
                  placeholder="Any special handling instructions, access codes, or delivery notes..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl mb-8 border border-blue-500/20">
                <div className="flex items-start">
                  <Info className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What's included</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                        <span>Real-time GPS tracking</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                        <span>Photo confirmation of delivery</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                        <span>SMS & email notifications</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                        <span>Up to $1000 insurance coverage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 h-12">
                  Save as template
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold">
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
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why choose OTW Package Delivery
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional package delivery service with advanced tracking, secure handling, and guaranteed delivery times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Real-time tracking</h3>
              <p className="text-gray-400">
                Track your package every step of the way with live GPS updates and notifications.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure handling</h3>
              <p className="text-gray-400">
                Professional couriers with background checks and secure vehicle storage.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Proof of delivery</h3>
              <p className="text-gray-400">
                Photo confirmation and digital signatures for complete peace of mind.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">City-wide coverage</h3>
              <p className="text-gray-400">
                Delivery anywhere in the metro area with competitive pricing and fast service.
              </p>
            </div>
          </div>

          {/* Pricing transparency */}
          <div className="mt-16">
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Transparent pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">$6.99</div>
                  <div className="text-white font-medium mb-1">Base rate</div>
                  <div className="text-gray-400 text-sm">First 5 miles included</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">$1.50</div>
                  <div className="text-white font-medium mb-1">Per additional mile</div>
                  <div className="text-gray-400 text-sm">Beyond 5 mile radius</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">Free</div>
                  <div className="text-white font-medium mb-1">Insurance</div>
                  <div className="text-gray-400 text-sm">Up to $1000 coverage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-8 py-4">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
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
