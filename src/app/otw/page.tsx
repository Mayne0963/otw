'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Car, 
  Package, 
  Clock, 
  MapPin, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Truck,
  Shield,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function OTWServicesPage() {
  const services = [
    {
      icon: ShoppingCart,
      title: "Grocery Shop & Drop",
      description: "We'll shop for your groceries and deliver them to your door",
      features: ["Receipt upload", "Custom shopping lists", "Same-day delivery", "Store selection"],
      price: "Starting at $4.99",
      popular: true,
      href: "/grocery-delivery",
      color: "otw-red"
    },
    {
      icon: Car,
      title: "Local Rides",
      description: "Quick and reliable transportation around your neighborhood",
      features: ["Door-to-door service", "Local drivers", "Affordable rates", "Real-time tracking"],
      price: "Starting at $3.99",
      popular: false,
      href: "/otw/rides",
      color: "otw-gold"
    },
    {
      icon: Package,
      title: "Package Delivery",
      description: "Fast and secure delivery for your packages and documents",
      features: ["Same-day delivery", "Package tracking", "Secure handling", "Photo confirmation"],
      price: "Starting at $2.99",
      popular: false,
      href: "/otw/package",
      color: "otw-red"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Choose Your Service",
      description: "Select from grocery delivery, local rides, or package delivery"
    },
    {
      step: 2,
      title: "Provide Details",
      description: "Share your requirements, location, and preferences"
    },
    {
      step: 3,
      title: "Get Matched",
      description: "We connect you with a nearby community helper"
    },
    {
      step: 4,
      title: "Track & Receive",
      description: "Monitor progress and receive your service with a smile"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Busy Parent",
      quote: "OTW grocery delivery saved me hours every week. The service is reliable and the helpers are so friendly!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Senior Citizen",
      quote: "I love that it's community-driven. The local drivers know the area well and always provide excellent service.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "College Student",
      quote: "Perfect for when I need groceries but don't have a car. Quick, affordable, and convenient!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative bg-otw-black shadow-sm border-b border-otw-red/30">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-otw-red/20 via-black to-otw-gold/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-otw-gold/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-otw-red/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-otw-red/20 border border-otw-red/30 text-otw-gold hover:bg-otw-red/30">
              Community-Powered Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent">
                OTW Services
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Your neighborhood helpers for grocery delivery, local rides, and package delivery. 
              <span className="text-otw-gold font-semibold">Fast, reliable, and powered by the community.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/grocery-delivery">
                <Button size="lg" className="bg-gradient-to-r from-otw-red to-otw-red/80 hover:from-otw-red/80 hover:to-otw-red text-white px-8 py-3 text-lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Order Grocery Delivery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="bg-otw-black/50 text-white border-2 border-otw-gold/50 hover:border-otw-gold px-8 py-3 text-lg">
                <Users className="w-5 h-5 mr-2" />
                Become a Helper
              </Button>
            </div>
            
            {/* Quick Service Access */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/otw/package">
                <Button variant="outline" className="w-full h-16 border-white/30 text-white hover:bg-white/10 flex items-center justify-center">
                  <Package className="mr-3 w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Package Delivery</div>
                    <div className="text-sm opacity-80">Send packages anywhere</div>
                  </div>
                </Button>
              </Link>
              <Link href="/otw/rides">
                <Button variant="outline" className="w-full h-16 border-white/30 text-white hover:bg-white/10 flex items-center justify-center">
                  <Car className="mr-3 w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Ride Service</div>
                    <div className="text-sm opacity-80">Book your ride now</div>
                  </div>
                </Button>
              </Link>
              <Link href="/otw/grocery-delivery">
                <Button variant="outline" className="w-full h-16 border-white/30 text-white hover:bg-white/10 flex items-center justify-center">
                  <ShoppingCart className="mr-3 w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Grocery Shopping</div>
                    <div className="text-sm opacity-80">Shop & deliver groceries</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Services Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose from our range of community-powered services designed to make your life easier.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-otw-red/30 shadow-lg bg-otw-black/50 hover:border-otw-gold/50 ${service.popular ? 'ring-2 ring-otw-gold shadow-lg' : ''}`}>
                  {service.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-otw-red to-otw-gold text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-${service.color} to-${service.color}/80`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2 text-white group-hover:text-otw-gold transition-colors">{service.title}</CardTitle>
                    <CardDescription className="text-base text-gray-300">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-otw-gold flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white mb-4">{service.price}</p>
                      <Link href={service.href}>
                        <Button className="w-full bg-gradient-to-r from-otw-red to-otw-red/80 hover:from-otw-red/80 hover:to-otw-red">
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Getting help from your community is simple and straightforward.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-otw-red to-otw-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real stories from real people in our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-lg bg-otw-black/50 border-otw-red/30 hover:border-otw-gold/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-otw-gold text-otw-gold" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-otw-red to-otw-gold rounded-2xl p-12 text-white border border-otw-gold/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust OTW for their daily needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/grocery-delivery">
              <Button size="lg" variant="secondary" className="bg-white text-otw-red hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Grocery Delivery
              </Button>
            </Link>
            <Link href="/otw">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-otw-red px-8 py-3 text-lg font-semibold">
                <Truck className="w-5 h-5 mr-2" />
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
