'use client';

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Phone,
  AlertTriangle,
  Shield,
  Car,
  MapPin,
  Clock,
} from 'lucide-react';

const emergencyContacts = [
  {
    name: 'Emergency Services',
    number: '911',
    description: 'For life-threatening emergencies',
    icon: <Heart className="w-6 h-6 text-red-500" />,
  },
  {
    name: 'OTW Emergency Line',
    number: '1-800-OTW-HELP',
    description: '24/7 support for OTW-related emergencies',
    icon: <Phone className="w-6 h-6 text-red-500" />,
  },
  {
    name: 'Roadside Assistance',
    number: '1-800-ROAD-HELP',
    description: 'For vehicle breakdowns and accidents',
    icon: <Car className="w-6 h-6 text-red-500" />,
  },
];

const safetyResources = [
  {
    title: 'Driver Safety',
    description: 'Essential safety guidelines for drivers',
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    link: '/emergency/driver-safety',
  },
  {
    title: 'Customer Safety',
    description: 'Safety tips for customers',
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    link: '/emergency/customer-safety',
  },
  {
    title: 'Emergency Procedures',
    description: 'Step-by-step emergency response procedures',
    icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    link: '/emergency/procedures',
  },
];

const nearbyHospitals = [
  {
    name: 'Fort Wayne Police Department',
    phone: '(260) 427-1222',
    address: '1 E Main St, Fort Wayne, IN 46802',
    type: 'police',
  },
  {
    name: 'Fort Wayne Fire Department',
    phone: '(260) 427-1234',
    address: '226 E Berry St, Fort Wayne, IN 46802',
    type: 'fire',
  },
  {
    name: 'Parkview Regional Medical Center',
    phone: '(260) 266-1000',
    address: '11109 Parkview Plaza Dr, Fort Wayne, IN 46845',
    type: 'medical',
  },
];

export default function EmergencyPage() {
  return (
    <div className="bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Emergency Alert Banner */}
        <Alert className="mb-4 border-red-500 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-lg font-semibold">
            If this is a life-threatening emergency, call 911 immediately
          </AlertDescription>
        </Alert>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-bold">
            Emergency Resources
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto"
          >
            Quick access to emergency contacts and safety information
          </p>
        </div>

        {/* Emergency Contacts Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold">
            Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact) => (
              <Card key={contact.name} className="h-full border-2 border-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {contact.icon}
                    <h3 className="ml-3 text-xl font-semibold">
                      {contact.name}
                    </h3>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {contact.number}
                  </div>
                  <p className="text-gray-600">
                    {contact.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Resources Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold">
            Safety Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safetyResources.map((resource) => (
              <Card key={resource.title} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {resource.icon}
                    <h3 className="ml-3 text-xl font-semibold">
                      {resource.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {resource.description}
                  </p>
                  <Button asChild variant="outline">
                    <Link href={resource.link}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nearby Hospitals Section */}
        <div>
          <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold">
            Nearby Hospitals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyHospitals.map((hospital) => (
              <Card key={hospital.name} className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {hospital.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{hospital.address}</p>
                        <p className="text-sm text-gray-500">{hospital.distance} away</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <p>{hospital.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <p>24/7 Emergency Care</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link
                      href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`}
                      target="_blank"
                    >
                      Get Directions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600">
            For non-emergency assistance, please visit our{' '}
            <Link href="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
