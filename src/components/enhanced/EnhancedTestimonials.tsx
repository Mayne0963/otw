'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating: number;
  content: string;
  service: string;
  location: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    avatar: "👩‍💼",
    rating: 5,
    content: "OTW has completely transformed our office lunch culture. The variety of restaurants and lightning-fast delivery keeps our team happy and productive. The catering service for our company events is absolutely phenomenal!",
    service: "Food Delivery & Catering",
    location: "Downtown Fort Wayne",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Marcus Williams",
    role: "Small Business Owner",
    avatar: "👨‍💼",
    rating: 5,
    content: "As a busy entrepreneur, OTW's grocery delivery service is a lifesaver. Fresh ingredients delivered right to my door, and their ride service gets me to important meetings on time. Exceptional quality across all services!",
    service: "Grocery & Rides",
    location: "West Central",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Event Coordinator",
    company: "Celebrations Plus",
    avatar: "👩‍🎨",
    rating: 5,
    content: "OTW's event catering exceeded all expectations for our client's wedding. The presentation was stunning, food quality impeccable, and their coordination team made everything seamless. Our clients were absolutely thrilled!",
    service: "Event Catering",
    location: "Aboite",
    date: "3 days ago"
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "College Student",
    avatar: "👨‍🎓",
    rating: 5,
    content: "Being a student on a budget, I love OTW's affordable delivery options and student discounts. The app is super easy to use, and I can track my order in real-time. Plus, their customer service is incredibly responsive!",
    service: "Food Delivery",
    location: "Near IPFW",
    date: "5 days ago"
  },
  {
    id: 5,
    name: "Jennifer Thompson",
    role: "Working Mom",
    avatar: "👩‍👧‍👦",
    rating: 5,
    content: "OTW is a game-changer for busy families! Their grocery delivery saves me hours every week, and when I need a break from cooking, their restaurant selection is amazing. The kids love tracking the delivery on the app!",
    service: "Grocery & Food Delivery",
    location: "Southwest",
    date: "1 week ago"
  },
  {
    id: 6,
    name: "Robert Kim",
    role: "Senior Executive",
    company: "Fort Wayne Industries",
    avatar: "👨‍💼",
    rating: 5,
    content: "The premium ride service is outstanding - professional drivers, immaculate vehicles, and always punctual. For business meetings and airport transfers, OTW is my go-to choice. Reliability you can count on!",
    service: "Premium Rides",
    location: "North Fort Wayne",
    date: "4 days ago"
  }
];

interface TestimonialCardProps {
  testimonial: Testimonial;
  isActive: boolean;
}

function TestimonialCard({ testimonial, isActive }: TestimonialCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ 
        opacity: isActive ? 1 : 0.7, 
        scale: isActive ? 1 : 0.95,
        y: 0
      }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${
        isActive 
          ? 'bg-gradient-to-br from-white/10 to-white/5 border-otw-gold/30 shadow-2xl shadow-otw-gold/10' 
          : 'bg-white/5 border-white/10'
      }`}
    >
      {/* Quote Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-4 right-4"
      >
        <ChatBubbleLeftIcon className="w-8 h-8 text-otw-gold/30" />
      </motion.div>

      {/* Rating */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center space-x-1 mb-6"
      >
        {[...Array(testimonial.rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <StarIcon className="w-5 h-5 text-yellow-400" />
          </motion.div>
        ))}
        <span className="text-white/80 text-sm ml-2">({testimonial.rating}.0)</span>
      </motion.div>

      {/* Content */}
      <motion.blockquote 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white/90 text-lg leading-relaxed mb-8 font-medium"
      >
        "{testimonial.content}"
      </motion.blockquote>

      {/* Service Tag */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-otw-gold/20 to-otw-red/20 border border-otw-gold/30 mb-6"
      >
        <span className="text-otw-gold text-sm font-medium">{testimonial.service}</span>
      </motion.div>

      {/* Author Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-otw-gold to-otw-red rounded-full flex items-center justify-center text-2xl shadow-lg"
          >
            {testimonial.avatar}
          </motion.div>
          <div>
            <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
            <p className="text-gray-300 text-sm">
              {testimonial.role}
              {testimonial.company && (
                <span className="text-otw-gold"> at {testimonial.company}</span>
              )}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {testimonial.location} • {testimonial.date}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hover Glow Effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-otw-gold/5 to-otw-red/5 rounded-2xl blur-xl -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1.2 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

export default function EnhancedTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-otw-red/10 to-transparent" />
      
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-otw-gold/10 to-otw-red/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-otw-red/10 to-otw-gold/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

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
            What <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent animate-gradient-text">Fort Wayne</span> Says
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Real stories from real customers who've experienced the 
            <span className="bg-gradient-to-r from-otw-gold to-otw-red bg-clip-text text-transparent font-semibold"> OTW difference</span> in their daily lives.
          </motion.p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-4">
            <motion.button
              onClick={prevTestimonial}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-otw-gold/30 transition-all duration-300 group"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white group-hover:text-otw-gold transition-colors" />
            </motion.button>
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 -mr-4">
            <motion.button
              onClick={nextTestimonial}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-otw-gold/30 transition-all duration-300 group"
            >
              <ChevronRightIcon className="w-6 h-6 text-white group-hover:text-otw-gold transition-colors" />
            </motion.button>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-8 px-8">
            <AnimatePresence mode="wait">
              {testimonials.slice(currentIndex, currentIndex + 3).concat(
                testimonials.slice(0, Math.max(0, (currentIndex + 3) - testimonials.length))
              ).map((testimonial, index) => (
                <TestimonialCard
                  key={`${testimonial.id}-${currentIndex}`}
                  testimonial={testimonial}
                  isActive={index === 1} // Middle card is active
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination Dots */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center space-x-3 mt-12"
        >
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToTestimonial(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-otw-gold shadow-lg shadow-otw-gold/30'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: '4.9/5', label: 'Average Rating', icon: '⭐' },
            { number: '50K+', label: 'Reviews', icon: '💬' },
            { number: '99%', label: 'Satisfaction Rate', icon: '😊' },
            { number: '24/7', label: 'Support Available', icon: '🎧' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-otw-gold/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent text-2xl md:text-3xl mb-2 font-bold">
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