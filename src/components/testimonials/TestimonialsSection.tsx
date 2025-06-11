'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  location: string;
  image?: string;
  verified: boolean;
  serviceType: string;
  featured: boolean;
}

interface TestimonialsSectionProps {
  limit?: number;
  featured?: boolean;
  serviceType?: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  limit = 3, 
  featured = true, 
  serviceType 
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (featured) params.append('featured', 'true');
        if (serviceType) params.append('serviceType', serviceType);
        if (limit) params.append('limit', limit.toString());
        
        const response = await fetch(`/api/loyalty?type=testimonials&${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setTestimonials(data.data.slice(0, limit));
        } else {
          throw new Error(data.error || 'Failed to load testimonials');
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err instanceof Error ? err.message : 'Failed to load testimonials');
        
        // Fallback to default testimonials if API fails
        setTestimonials([
          {
            id: 'fallback-1',
            name: 'Sarah Johnson',
            role: 'Regular Customer',
            quote: 'OTW has completely changed how I handle daily errands. The grocery delivery is always fresh and on time!',
            rating: 5,
            location: 'Downtown Fort Wayne',
            verified: true,
            serviceType: 'grocery',
            featured: true
          },
          {
            id: 'fallback-2',
            name: 'Mike Chen',
            role: 'Business Owner',
            quote: 'Their package delivery service is incredibly reliable. I use them for all my business shipments now.',
            rating: 5,
            location: 'West Central',
            verified: true,
            serviceType: 'delivery',
            featured: true
          },
          {
            id: 'fallback-3',
            name: 'Emily Rodriguez',
            role: 'Busy Parent',
            quote: 'As a working mom, OTW is a lifesaver. From rides to groceries, they handle everything perfectly!',
            rating: 5,
            location: 'Northside',
            verified: true,
            serviceType: 'rides',
            featured: true
          }
        ].slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [limit, featured, serviceType]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="otw-card p-8 animate-pulse">
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gray-700 rounded mr-1" />
              ))}
            </div>
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gray-700 rounded-full mr-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-24" />
                <div className="h-3 bg-gray-700 rounded w-16" />
                <div className="h-3 bg-gray-700 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Unable to load testimonials at the moment.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-otw-gold hover:text-otw-gold/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div 
          key={testimonial.id} 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          whileHover={{ y: -5 }}
          className="otw-card p-8 group hover:border-otw-gold/40 transition-all duration-500"
        >
          <div className="flex items-center mb-6">
            {[...Array(testimonial.rating)].map((_, i) => (
              <StarIcon 
                key={i} 
                className="w-6 h-6 text-otw-gold fill-current mr-1 group-hover:scale-110 transition-transform duration-300" 
                style={{ transitionDelay: `${i * 50}ms` }} 
              />
            ))}
            {testimonial.verified && (
              <span className="ml-2 text-xs text-otw-gold bg-otw-gold/10 px-2 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-8 italic leading-relaxed text-lg group-hover:text-white transition-colors duration-300">
            "{testimonial.quote}"
          </p>
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-otw-gold to-otw-red rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              {testimonial.image ? (
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg group-hover:text-otw-gold transition-colors duration-300">
                {testimonial.name}
              </h4>
              <p className="text-gray-400 text-sm">{testimonial.role}</p>
              <p className="text-otw-gold text-xs font-medium mt-1">{testimonial.location}</p>
              {testimonial.serviceType && (
                <p className="text-gray-500 text-xs mt-1 capitalize">
                  {testimonial.serviceType} service
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TestimonialsSection;