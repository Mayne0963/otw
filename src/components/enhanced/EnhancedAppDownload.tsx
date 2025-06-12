'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../ui/button';
import { 
  DevicePhoneMobileIcon,
  StarIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  MapPinIcon,
  CreditCardIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AppFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const appFeatures: AppFeature[] = [
  {
    icon: <MapPinIcon className="w-6 h-6" />,
    title: "Real-Time Tracking",
    description: "Track your order, ride, or delivery in real-time with live GPS updates"
  },
  {
    icon: <CreditCardIcon className="w-6 h-6" />,
    title: "Secure Payments",
    description: "Multiple payment options with bank-level security and encryption"
  },
  {
    icon: <BellIcon className="w-6 h-6" />,
    title: "Smart Notifications",
    description: "Get instant updates on your orders, special offers, and delivery status"
  },
  {
    icon: <BoltIcon className="w-6 h-6" />,
    title: "Lightning Fast",
    description: "Optimized for speed with instant ordering and quick checkout"
  },
  {
    icon: <HeartIcon className="w-6 h-6" />,
    title: "Personalized Experience",
    description: "AI-powered recommendations based on your preferences and history"
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee with easy refunds and customer support"
  }
];

interface PhoneMockupProps {
  className?: string;
}

function PhoneMockup({ className = '' }: PhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      className={`relative ${className}`}
    >
      {/* Phone Frame */}
      <div className="relative w-80 h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-3 text-white text-sm">
            <span className="font-medium">9:41</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-2 bg-white rounded-sm" />
              <div className="w-6 h-3 border border-white rounded-sm">
                <div className="w-4 h-full bg-green-500 rounded-sm" />
              </div>
            </div>
          </div>

          {/* App Content */}
          <div className="px-4 pb-4 h-full">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl font-bold text-white mb-2">OTW</h3>
              <p className="text-gray-300 text-sm">Your cravings, delivered</p>
            </motion.div>

            {/* Service Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              {[
                { emoji: '🍕', label: 'Food', color: 'from-red-500 to-orange-500' },
                { emoji: '🛒', label: 'Grocery', color: 'from-green-500 to-emerald-500' },
                { emoji: '🚗', label: 'Rides', color: 'from-blue-500 to-purple-500' }
              ].map((service, index) => (
                <motion.div
                  key={service.label}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                  className={`bg-gradient-to-br ${service.color} rounded-xl p-3 text-center`}
                >
                  <div className="text-2xl mb-1">{service.emoji}</div>
                  <div className="text-white text-xs font-medium">{service.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Featured Restaurant Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 mb-4 border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-otw-gold to-otw-red rounded-lg flex items-center justify-center text-xl">
                  🍔
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">Burger Palace</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white text-xs">4.8</span>
                    </div>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-400 text-xs">15-25 min</span>
                  </div>
                </div>
                <div className="text-otw-gold text-xs font-medium">$2.99 delivery</div>
              </div>
            </motion.div>

            {/* Order Tracking */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold text-sm">Order #1234</h4>
                <span className="text-green-400 text-xs font-medium">On the way</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-xs">Your driver Marcus is 5 min away</div>
                  <div className="text-gray-400 text-xs">Track in real-time</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Phone Reflection */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[3rem] pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-otw-gold to-otw-red rounded-full flex items-center justify-center shadow-lg"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <BoltIcon className="w-4 h-4 text-white" />
      </motion.div>
      
      <motion.div
        className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
        animate={{ 
          y: [0, 10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartIcon className="w-3 h-3 text-white fill-current" />
      </motion.div>
    </motion.div>
  );
}

interface DownloadButtonProps {
  platform: 'ios' | 'android';
  className?: string;
}

function DownloadButton({ platform, className = '' }: DownloadButtonProps) {
  const isIOS = platform === 'ios';
  
  return (
    <motion.a
      href={isIOS ? '#' : '#'}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center space-x-3 bg-black hover:bg-gray-900 text-white px-6 py-4 rounded-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 group ${className}`}
    >
      <div className="text-3xl">
        {isIOS ? '🍎' : '🤖'}
      </div>
      <div>
        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
          {isIOS ? 'Download on the' : 'Get it on'}
        </div>
        <div className="text-lg font-semibold group-hover:text-otw-gold transition-colors">
          {isIOS ? 'App Store' : 'Google Play'}
        </div>
      </div>
    </motion.a>
  );
}

export default function EnhancedAppDownload() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-otw-red/5 to-transparent" />
      
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-otw-gold/10 to-otw-red/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Get the <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent animate-gradient-text">OTW App</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Experience Fort Wayne's premier delivery service in the palm of your hand. 
                <span className="bg-gradient-to-r from-otw-gold to-otw-red bg-clip-text text-transparent font-semibold"> Download now</span> and get your first delivery free!
              </p>
              
              {/* App Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { number: '4.9★', label: 'App Rating' },
                  { number: '100K+', label: 'Downloads' },
                  { number: '24/7', label: 'Support' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent text-2xl font-bold mb-1">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Download Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <DownloadButton platform="ios" />
              <DownloadButton platform="android" />
            </motion.div>

            {/* App Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Why Choose Our App?</h3>
              <div className="grid gap-4">
                {appFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    onHoverStart={() => setHoveredFeature(index)}
                    onHoverEnd={() => setHoveredFeature(null)}
                    className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                      hoveredFeature === index 
                        ? 'bg-gradient-to-r from-white/10 to-white/5 border border-otw-gold/30' 
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <motion.div
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        hoveredFeature === index 
                          ? 'bg-gradient-to-br from-otw-gold to-otw-red text-white' 
                          : 'bg-white/10 text-otw-gold'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <PhoneMockup />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20 p-8 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Experience <span className="bg-gradient-to-r from-otw-gold to-otw-red bg-clip-text text-transparent">OTW</span>?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers in Fort Wayne. Download the app today and get your first order delivered free!
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-otw-gold to-otw-red hover:from-otw-gold/80 hover:to-otw-red/80 text-white font-semibold px-8 py-4 text-lg">
              <DevicePhoneMobileIcon className="w-5 h-5 mr-2" />
              Download Now - It's Free!
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}