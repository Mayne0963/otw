'use client';

import React from 'react';
import { GoogleMapsProvider } from '@/components/GoogleMapsContext';
import { EnhancedBookingForm } from '@/components/EnhancedBookingForm';

export default function BookingPage() {
  const handleBookingSubmit = (bookingData: any) => {
    console.log('Enhanced booking submitted:', bookingData);
    // Handle the enhanced booking form submission
  };

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white mb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">
                Book Your Ride
              </h1>
              <p className="text-xl text-blue-100">
                Professional transportation services in Fort Wayne
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4">
          <EnhancedBookingForm
             onSubmit={handleBookingSubmit}
             serviceArea={{
               center: { lat: 41.0793, lng: -85.1394 },
               radius: 50000
             }}
             maxPassengers={6}
             minAdvanceBookingHours={1}
             showDeliveryOption={true}
             showDestinationOption={true}
           />
         </div>

         {/* Footer */}
         <div className="bg-gray-800 text-white mt-16">
           <div className="container mx-auto px-4 py-8">
             <div className="text-center">
               <p>© 2024 OTW Services. All rights reserved.</p>
               <p className="mt-2 text-sm text-gray-300">
                 Need help? Contact us at support@otwservices.com
               </p>
             </div>
           </div>
         </div>
      </div>
    </GoogleMapsProvider>
  );
}