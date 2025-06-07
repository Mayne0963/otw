'use client';

import React from 'react';
import { ModernGoogleMapsProvider } from '@/contexts/ModernGoogleMapsContext';
import ModernBookingForm from '@/components/enhanced/ModernBookingForm';
import { BookingFormData } from '@/components/enhanced/ModernBookingForm';

const BookingPage: React.FC = () => {
  const handleBookingSubmit = async (data: BookingFormData) => {
    console.log('Booking submitted:', data);
    
    try {
      // Here you would typically send the data to your backend API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or redirect
      alert('Booking submitted successfully! We will contact you shortly to confirm your ride.');
    } catch (error) {
      console.error('Booking submission error:', error);
      throw new Error('Failed to submit booking. Please try again.');
    }
  };

  return (
    <ModernGoogleMapsProvider>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Book Your Ride
          </h1>
          <ModernBookingForm
            onSubmit={handleBookingSubmit}
            serviceArea={{
              center: { lat: 41.0858, lng: -85.1394 }, // Fort Wayne, IN
              radius: 50000, // 50km radius
            }}
            maxPassengers={8}
            minAdvanceBookingHours={2}
            enableDestinationField={true}
            enableDeliveryField={false}
          />
        </div>
      </div>
    </ModernGoogleMapsProvider>
  );
};

export default BookingPage;