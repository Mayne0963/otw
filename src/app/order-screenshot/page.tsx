'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ScreenshotOrderForm from '../../components/orders/ScreenshotOrderForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Camera, Clock, MapPin, Phone } from 'lucide-react';

export default function ScreenshotOrderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Screenshot Order Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Order your favorite food from any restaurant and we'll pick it up for you!
            Simply take a screenshot of your order and we'll handle the rest.
          </p>
        </div>

        {/* How It Works Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-orange-500" />
              How It Works
            </CardTitle>
            <CardDescription>
              Our simple 4-step process to get your food delivered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Order Online</h3>
                <p className="text-sm text-gray-600">
                  Place your order on the restaurant's website or app
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Take Screenshot</h3>
                <p className="text-sm text-gray-600">
                  Screenshot your order confirmation and upload it here
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">We Pick Up</h3>
                <p className="text-sm text-gray-600">
                  Our team will pick up your order from the restaurant
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold text-lg">4</span>
                </div>
                <h3 className="font-semibold mb-2">Enjoy!</h3>
                <p className="text-sm text-gray-600">
                  Pick up your food or have it delivered to you
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Quick Service</h3>
              </div>
              <p className="text-sm text-gray-600">
                Most orders are picked up within 30-45 minutes during peak hours
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Wide Coverage</h3>
              </div>
              <p className="text-sm text-gray-600">
                We pick up from restaurants across the city and surrounding areas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Real-time Updates</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get SMS/call updates on your order status from pickup to delivery
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Order</CardTitle>
            <CardDescription>
              Fill out the form below and upload your order screenshot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            }>
              <ScreenshotOrderForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>
                  Please ensure your screenshot clearly shows the order details, total amount, and pickup location
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>
                  We will call you to confirm the order details before pickup
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>
                  Service fees and delivery charges will be calculated and communicated during confirmation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>
                  Payment will be collected upon pickup or delivery (cash, card, or digital payment accepted)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>
                  Orders are processed during business hours: Monday-Sunday, 10 AM - 10 PM
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}