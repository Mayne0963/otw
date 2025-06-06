'use client';

import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { GoogleMapsProvider } from '../../../contexts/GoogleMapsContext';
import { useState } from 'react';
import { MapPin, Clock, Calendar, User } from 'lucide-react';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    instructions: '',
    isEmergency: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    alert('Booking submitted successfully!');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                Book Your Service
              </h1>
              <p className="text-xl text-gray-300">
                Professional transportation and delivery services
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-900 border-gray-800 shadow-2xl">
              <CardHeader className="text-center border-b border-gray-800">
                <CardTitle className="text-2xl text-yellow-400">
                  Service Booking Form
                </CardTitle>
                <p className="text-gray-400 mt-2">
                  Fill out the details below to book your service
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={formData.pickup}
                      onChange={(e) => handleInputChange('pickup', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Enter pickup address"
                      required
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Destination
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Enter destination address"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Clock className="inline w-4 h-4 mr-2" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      Number of Passengers
                    </label>
                    <select
                      value={formData.passengers}
                      onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Any special requests or instructions..."
                      rows={3}
                    />
                  </div>

                  {/* Emergency Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emergency"
                      checked={formData.isEmergency}
                      onChange={(e) => handleInputChange('isEmergency', e.target.checked)}
                      className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400 focus:ring-2"
                    />
                    <label htmlFor="emergency" className="ml-2 text-sm text-gray-300">
                      This is an emergency request
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Book Now
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 border-t border-gray-800 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-400">
              <p>© 2024 OTW Services. All rights reserved.</p>
              <p className="mt-2 text-sm">
                Need help? Contact us at support@otwservices.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}