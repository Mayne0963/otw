'use client';

// export const dynamic = "force-dynamic";

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Button from '../components/Button.jsx';
import AddressSearch, { PlaceDetails } from '../components/AddressSearch';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon, PhoneIcon, ClockIcon, TruckIcon, ShoppingBagIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, StarIcon, HeartIcon } from '@heroicons/react/24/solid';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import EnhancedHeroSection from '@/components/enhanced/EnhancedHeroSection';
import EnhancedServiceCards from '@/components/enhanced/EnhancedServiceCards';
import EnhancedTestimonials from '@/components/enhanced/EnhancedTestimonials';
import EnhancedAppDownload from '@/components/enhanced/EnhancedAppDownload';

const MapSearch = dynamic(() => import('../components/maps/MapSearch'), { ssr: false });

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  href,
  buttonText,
  buttonVariant,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    whileHover={{ scale: 1.02, y: -8 }}
    whileTap={{ scale: 0.98 }}
    className="otw-card group relative overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:shadow-otw-red/20"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-otw-red/5 via-transparent to-otw-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-otw-gold/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10 p-8">
      <div className="w-20 h-20 bg-gradient-to-br from-otw-red to-otw-red/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
        <span className="text-3xl animate-pulse drop-shadow-sm">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-otw-gold transition-colors duration-300">{title}</h3>
      <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">{description}</p>
      <Link href={href}>
        <Button variant={buttonVariant} className="w-full group-hover:scale-105 transition-transform duration-300">
          {buttonText}
        </Button>
      </Link>
    </div>
  </motion.div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<PlaceDetails | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);

  const handleAddressSelect = (place: PlaceDetails) => {
    setSelectedAddress(place);
    console.log('Selected address:', place.formatted_address);
    console.log('Coordinates:', place.geometry.location.lat(), place.geometry.location.lng());
  };

  return (
    <main className="min-h-screen overflow-hidden">
        {/* Enhanced Hero Section */}
        <EnhancedHeroSection />

      {/* Enhanced Services Section */}
      <EnhancedServiceCards />

      {/* Restaurant Search Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect Meal
            </h2>
            <p className="text-xl text-white/80">
              Search from 150+ restaurants in Fort Wayne
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold"
              />
              <div className="md:w-64">
                <AddressSearch
                  onPlaceSelect={handleAddressSelect}
                  placeholder="Enter your address in Fort Wayne, IN..."
                  className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold"
                />
              </div>
              <Link href="/restaurants">
                <Button variant="primary" className="px-8 py-4">
                  Search
                </Button>
              </Link>
            </div>

            <MapSearch />
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
{/**   <section className="py-24">
*        <div className="max-w-7xl mx-auto px-4">
*          <div className="text-center mb-16">
*            <h2 className="text-4xl font-bold text-white mb-4">
*              Featured Restaurants
*            </h2>
*            <p className="text-xl text-white/80">
*              Top-rated spots loved by Fort Wayne
*            </p>
*          </div>
*
*          <div className="flex flex-wrap justify-center gap-4 mb-12">
*            {['All', 'Pizza', 'Asian', 'Mexican', 'American', 'Healthy'].map((category) => (
*              <Link key={category} href={`/restaurants?category=${category.toLowerCase()}`}>
*                <button
*                  className="px-6 py-3 bg-white/10 hover:bg-otw-gold/20 border border-white/20 hover:border-otw-gold/50 rounded-full text-white hover:text-otw-gold transition-all duration-300"
*                >
*                  {category}
*                </button>
*              </Link>
*            ))}
*          </div>
*
*          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
*            {[
*              {
*                name: 'Broskis',
*                cuisine: 'American',
*                rating: 4.9,
*                deliveryTime: '15-25 min',
*                image: '/restaurants/broskis.jpg',
*              },
*            ].map((restaurant, index) => (
*              <div key={index} className="otw-card group cursor-pointer">
*                <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
*                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
*                  <div className="absolute top-4 right-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
*                    {restaurant.deliveryTime}
*                  </div>
*                  <div className="w-full h-full bg-gradient-to-br from-otw-red/20 to-otw-gold/20 flex items-center justify-center">
*                    <span className="text-6xl opacity-50">🍽️</span>
*                  </div>
*                </div>
*                <div className="p-6">
*                  <h3 className="text-xl font-bold text-white mb-2">{restaurant.name}</h3>
*                  <p className="text-white/70 mb-3">{restaurant.cuisine}</p>
*                  <div className="flex items-center justify-between">
*                    <div className="flex items-center">
*                      <span className="text-yellow-400 mr-1">⭐</span>
*                      <span className="text-white font-semibold">{restaurant.rating}</span>
*                    </div>
*                    <Link href={`/restaurant/${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
*                      <Button variant="primary" className="text-sm px-4 py-2">
*                        Order Now
*                      </Button>
*                    </Link>
*                  </div>
*                </div>
*              </div>
*            ))}
*          </div>
*        </div>
*      </section>
*/}

       {/* Enhanced Customer Testimonials */}
      <EnhancedTestimonials />

      {/* Enhanced App Download Section */}
      <EnhancedAppDownload />



      {/* Enhanced Services Section */}
      <section className="py-24 relative">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-otw-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-otw-red/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-otw-gold/30 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent">
                Premium Services
              </span>
              <br />
              <span className="text-white">for Fort Wayne</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Beyond food delivery - we&apos;re your complete lifestyle solution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon="🥘"
              title="Catering Services"
              description="Professional catering for events, meetings, and special occasions with premium presentation."
              href="/events"
              buttonText="Plan Event"
              buttonVariant="primary"
            />
            <ServiceCard
              icon="🛍️"
              title="Personal Shopping"
              description="Grocery shopping, pharmacy runs, and retail pickup services delivered to your door."
              href="/shop"
              buttonText="Start Shopping"
              buttonVariant="secondary"
            />
            <ServiceCard
              icon="⭐"
              title="VIP Membership"
              description="Exclusive perks, priority delivery, and special discounts for our premium members."
              href="/tier"
              buttonText="Join VIP"
              buttonVariant="primary"
            />
          </div>
        </div>
      </section>

      {/* Enhanced Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-otw-red via-otw-red-600 to-otw-gold relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight"
            >
              Stay in the <span className="relative">
                <span className="bg-white bg-clip-text text-transparent">Loop</span>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2 w-8 h-8 border-2 border-white rounded-full border-dashed opacity-60"
                />
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Get <span className="font-semibold text-white">exclusive deals</span>, new restaurant announcements, and <span className="font-semibold text-white">delivery updates</span> straight to your inbox.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 text-lg font-medium shadow-lg"
                  />
                  <motion.div 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    ✉️
                  </motion.div>
                </div>
                <Button 
                  variant="secondary" 
                  className="px-8 py-4 rounded-xl bg-white text-otw-red hover:bg-gray-100 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Subscribe Now
                </Button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-6 flex items-center justify-center space-x-6 text-white/80 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                  <span>Unsubscribe anytime</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/80"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-white/20 rounded-full border-2 border-white" />
                ))}
              </div>
              <span className="text-sm font-medium">Join 10,000+ subscribers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium">Rated 4.9/5 by subscribers</span>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
