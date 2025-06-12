'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { 
  TruckIcon, 
  ShoppingBagIcon, 
  CalendarIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

interface ServiceFeature {
  icon: React.ReactNode;
  text: string;
}

interface ServiceCardData {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
  features: ServiceFeature[];
  stats: {
    rating: number;
    orders: string;
    time: string;
  };
  gradient: string;
  hoverGradient: string;
}

const serviceCards: ServiceCardData[] = [
  {
    id: 'rides',
    icon: '🚗',
    title: 'Premium Rides',
    description: 'Professional drivers with premium vehicles for safe, comfortable transportation around Fort Wayne.',
    href: '/otw/rides',
    buttonText: 'Book a Ride',
    buttonVariant: 'default',
    features: [
      { icon: <CheckCircleIcon className="w-4 h-4" />, text: 'Background-checked drivers' },
      { icon: <ClockIcon className="w-4 h-4" />, text: '5-minute pickup time' },
      { icon: <StarIcon className="w-4 h-4" />, text: 'Premium vehicle fleet' }
    ],
    stats: {
      rating: 4.9,
      orders: '10K+',
      time: '5 min'
    },
    gradient: 'from-blue-500/20 to-purple-500/20',
    hoverGradient: 'from-blue-500/30 to-purple-500/30'
  },
  {
    id: 'grocery',
    icon: '🛒',
    title: 'Grocery Delivery',
    description: 'Fresh groceries from local stores delivered to your door with same-day delivery and quality guarantee.',
    href: '/otw/grocery-delivery',
    buttonText: 'Shop Groceries',
    buttonVariant: 'outline',
    features: [
      { icon: <CheckCircleIcon className="w-4 h-4" />, text: 'Fresh quality guarantee' },
      { icon: <TruckIcon className="w-4 h-4" />, text: 'Same-day delivery' },
      { icon: <ShoppingBagIcon className="w-4 h-4" />, text: 'Local store partnerships' }
    ],
    stats: {
      rating: 4.8,
      orders: '25K+',
      time: '2 hrs'
    },
    gradient: 'from-green-500/20 to-emerald-500/20',
    hoverGradient: 'from-green-500/30 to-emerald-500/30'
  },
  {
    id: 'catering',
    icon: '🎉',
    title: 'Event Catering',
    description: 'Professional catering services for parties, meetings, and special events with premium presentation.',
    href: '/events',
    buttonText: 'Plan Event',
    buttonVariant: 'default',
    features: [
      { icon: <CalendarIcon className="w-4 h-4" />, text: 'Advanced booking' },
      { icon: <StarIcon className="w-4 h-4" />, text: 'Premium presentation' },
      { icon: <CheckCircleIcon className="w-4 h-4" />, text: 'Event coordination' }
    ],
    stats: {
      rating: 5.0,
      orders: '500+',
      time: '24 hrs'
    },
    gradient: 'from-orange-500/20 to-red-500/20',
    hoverGradient: 'from-orange-500/30 to-red-500/30'
  }
];

interface EnhancedServiceCardProps {
  service: ServiceCardData;
  index: number;
}

function EnhancedServiceCard({ service, index }: EnhancedServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden"
    >
      {/* Main Card */}
      <div className="otw-card h-full p-8 relative z-10">
        {/* Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${isHovered ? service.hoverGradient : service.gradient} transition-all duration-500`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
        />
        
        {/* Floating Background Elements */}
        <motion.div
          className="absolute top-4 right-4 text-6xl opacity-10"
          animate={{ 
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {service.icon}
        </motion.div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-otw-red to-otw-red/80 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-2xl">{service.icon}</span>
            </motion.div>
            
            <motion.button
              onClick={() => setIsLiked(!isLiked)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <HeartIcon className={`w-5 h-5 transition-colors duration-300 ${isLiked ? 'text-red-500 fill-current' : 'text-white/60'}`} />
            </motion.button>
          </div>

          {/* Title and Description */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-otw-gold transition-colors duration-300">
            {service.title}
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {service.description}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {service.features.map((feature, featureIndex) => (
              <motion.div
                key={featureIndex}
                className="flex items-center space-x-3 text-sm text-gray-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * featureIndex }}
              >
                <span className="text-otw-gold">{feature.icon}</span>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{service.stats.rating}</span>
              </div>
              <span className="text-xs text-gray-400">Rating</span>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold mb-1">{service.stats.orders}</div>
              <span className="text-xs text-gray-400">Orders</span>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold mb-1">{service.stats.time}</div>
              <span className="text-xs text-gray-400">Avg Time</span>
            </div>
          </div>

          {/* Action Button */}
          <Link href={service.href} className="block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant={service.buttonVariant}
                className="w-full group/btn relative overflow-hidden"
                size="lg"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>{service.buttonText}</span>
                  <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
                
                {/* Button hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-otw-gold/20 to-otw-red/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-otw-gold/10 to-otw-red/10 rounded-2xl blur-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.1 : 0.8
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default function EnhancedServiceCards() {
  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-otw-red/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight"
          >
            Your <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent animate-gradient-text">Cravings</span>, Our Mission
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            From late-night munchies to family feasts, we've got Fort Wayne covered with 
            <span className="bg-gradient-to-r from-otw-gold to-otw-red bg-clip-text text-transparent font-semibold"> premium delivery services</span> that exceed expectations.
          </motion.p>
        </motion.div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {serviceCards.map((service, index) => (
            <EnhancedServiceCard 
              key={service.id} 
              service={service} 
              index={index} 
            />
          ))}
        </div>

        {/* Service Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: '50K+', label: 'Happy Customers', icon: '😊' },
            { number: '99.9%', label: 'On-Time Delivery', icon: '⏰' },
            { number: '24/7', label: 'Customer Support', icon: '🎧' },
            { number: '15min', label: 'Average Delivery', icon: '🚀' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-otw-gold/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent text-3xl md:text-4xl mb-2 font-bold">
                {stat.number}
              </div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}