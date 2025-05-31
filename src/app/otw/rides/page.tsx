"use client";

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
import { useState } from "react";

export default function RidesPage() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const vehicleTypes = [
    {
      id: "standard",
      name: "OTW Standard",
      description: "Affordable rides for up to 4 passengers",
      capacity: "4 passengers",
      eta: "3-5 min",
      price: "$12.50",
      icon: Car,
    },
    {
      id: "suv",
      name: "OTW SUV",
      description: "Extra space for groups and luggage",
      capacity: "6 passengers",
      eta: "5-8 min",
      price: "$18.75",
      icon: Car,
    },
    {
      id: "luxury",
      name: "OTW Luxury",
      description: "Premium vehicles for special occasions",
      capacity: "4 passengers",
      eta: "8-12 min",
      price: "$24.99",
      icon: Car,
    },
  ];

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
                  <span className="font-semibold">4.9</span>
                  <span className="ml-1">rating</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Shield className="w-5 h-5 text-otw-gold mr-2" />
                  <span>Insured & licensed</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-5 h-5 text-otw-gold mr-2" />
                  <span>10,000+ rides</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick booking form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Book your ride</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-otw-gold rounded-full"></div>
                  <Input
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-otw-red rounded-full"></div>
                  <Input
                    placeholder="Where to?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-otw-gold hover:bg-otw-gold/90 text-black"
                  disabled={!pickup || !destination}
                >
                  Get fare estimate
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              
              {estimatedFare && (
                <div className="mt-6 p-4 bg-otw-gold/10 rounded-lg border border-otw-gold/20">
                  <p className="text-otw-gold font-semibold">Estimated fare: {estimatedFare}</p>
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
              const IconComponent = vehicle.icon;
              return (
                <div
                  key={vehicle.id}
                  className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                    selectedVehicle === vehicle.id
                      ? "border-otw-gold shadow-lg scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  {selectedVehicle === vehicle.id && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-otw-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="w-12 h-12 text-gray-700" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{vehicle.price}</div>
                      <div className="text-sm text-gray-500">{vehicle.eta}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                  <p className="text-gray-600 mb-3">{vehicle.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {vehicle.capacity}
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

              <div className="bg-gradient-to-r from-otw-gold/10 to-otw-red/10 p-6 rounded-xl mb-8 border border-otw-gold/20">
                <div className="flex items-start">
                  <Info className="w-6 h-6 text-otw-gold mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fare breakdown</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Base fare</span>
                        <span>$8.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance (4.2 miles)</span>
                        <span>$4.00</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1 mt-2">
                        <span>Total</span>
                        <span>$12.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 h-12">
                  Save for later
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full h-12 bg-otw-gold hover:bg-otw-gold/90 text-black font-semibold">
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
                Average pickup time under 5 minutes. We respect your schedule.
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
                4.9/5 average rating from thousands of satisfied customers.
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
              <span className="text-white font-medium">Join 10,000+ happy riders in Fort Wayne</span>
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
