'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, SparklesIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import Link from 'next/link';
import AddressSearch, { PlaceDetails } from '../AddressSearch';

interface HeroFeature {
  icon: React.ReactNode;
  text: string;
  color: string;
}

const heroFeatures: HeroFeature[] = [
  {
    icon: <TruckIcon className="w-5 h-5" />,
    text: "Free Delivery on Broski's Orders",
    color: "text-green-400"
  },
  {
    icon: <ClockIcon className="w-5 h-5" />,
    text: "15-Min Average Delivery Time",
    color: "text-blue-400"
  },
  {
    icon: <SparklesIcon className="w-5 h-5" />,
    text: "24/7 Customer Support",
    color: "text-purple-400"
  }
];

const floatingElements = [
  { emoji: '🍕', delay: 0, duration: 4 },
  { emoji: '🛒', delay: 1, duration: 5 },
  { emoji: '🚗', delay: 2, duration: 6 },
  { emoji: '⭐', delay: 0.5, duration: 4.5 },
  { emoji: '🎉', delay: 1.5, duration: 5.5 },
];

export default function EnhancedHeroSection() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<PlaceDetails | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % heroFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddressSelect = (place: PlaceDetails) => {
    setSelectedAddress(place);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-otw-gold/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-otw-red/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: element.delay,
            }}
          >
            {element.emoji}
          </motion.div>
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-otw-black/20 to-otw-black/40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Enhanced OTW Branding */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Main Logo */}
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-wider"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl">
              OTW
            </span>
          </motion.h1>
          
          {/* Animated Tagline */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl text-white/90 font-medium mb-4">
              Fort Wayne's Premier Delivery Platform
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-otw-gold to-transparent mx-auto" />
          </motion.div>

          {/* Rotating Features */}
          <motion.div 
            className="h-16 flex items-center justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                className={`flex items-center space-x-3 ${heroFeatures[currentFeature].color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {heroFeatures[currentFeature].icon}
                <span className="text-lg font-semibold">
                  {heroFeatures[currentFeature].text}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Enhanced Service Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/restaurants">
              <Button 
                size="xl"
                className="bg-gradient-to-r from-otw-red to-otw-red/80 hover:from-otw-red/90 hover:to-otw-red/70 text-white shadow-2xl hover:shadow-otw-red/30 border border-otw-red/50 px-12 py-6 text-xl font-bold"
              >
                🍕 Order Broski's = Free Delivery
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/otw/grocery-delivery">
              <Button 
                size="xl"
                variant="outline"
                className="bg-gradient-to-r from-otw-gold to-otw-gold/80 text-otw-black hover:from-otw-gold/90 hover:to-otw-gold/70 shadow-2xl hover:shadow-otw-gold/30 border border-otw-gold/50 px-12 py-6 text-xl font-bold"
              >
                🛒 Order Groceries
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick Address Search */}
        <motion.div
          className="max-w-md mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Delivery Check
            </h3>
            <AddressSearch
              onPlaceSelect={handleAddressSelect}
              placeholder="Enter your Fort Wayne address..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold"
            />
            {selectedAddress && (
              <motion.div
                className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-green-400 text-sm font-medium">
                  ✅ We deliver to your area!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-otw-gold/50 rounded-full flex justify-center bg-otw-black/30 backdrop-blur-sm cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }}
        >
          <motion.div 
            className="w-1 h-3 bg-otw-gold rounded-full mt-2"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <p className="text-white/60 text-xs mt-2 text-center">Scroll to explore</p>
      </motion.div>
    </section>
  );
}