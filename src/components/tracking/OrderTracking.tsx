"use client"

import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { MapSearch } from '../maps/MapSearch'
import { Clock, Phone, MessageCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface TrackingStatus {
  status: 'preparing' | 'picked_up' | 'in_transit' | 'arrived'
  estimatedArrival: string
  currentLocation: {
    lat: number
    lng: number
    address: string
  }
  driver?: {
    name: string
    phone: string
    vehicle: string
    photo: string
  }
}

const statusSteps = [
  { id: 'preparing', label: 'Preparing' },
  { id: 'picked_up', label: 'Picked Up' },
  { id: 'in_transit', label: 'In Transit' },
  { id: 'arrived', label: 'Arrived' },
]

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
    status: 'preparing',
    estimatedArrival: '30 mins',
    currentLocation: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY',
    },
    driver: {
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      vehicle: 'Toyota Camry - ABC123',
      photo: '/placeholder-driver.jpg',
    },
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update tracking status (in real app, this would come from your backend)
      setTrackingStatus((prev) => ({
        ...prev,
        estimatedArrival: `${Math.max(0, parseInt(prev.estimatedArrival) - 1)} mins`,
      }))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const currentStepIndex = statusSteps.findIndex((step) => step.id === trackingStatus.status)
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Order #{orderId}</h2>
            <p className="text-gray-500">Estimated arrival in {trackingStatus.estimatedArrival}</p>
          </div>
          <Badge variant={trackingStatus.status === 'arrived' ? 'success' : 'default'}>
            {statusSteps[currentStepIndex].label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {statusSteps.map((step, index) => (
              <div
                key={step.id}
                className={`text-sm ${
                  index <= currentStepIndex ? 'text-otw-gold-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="mb-6">
          <MapSearch
            defaultLocation={trackingStatus.currentLocation}
            height="300px"
            showSearchBar={false}
          />
        </div>

        {/* Driver Info */}
        {trackingStatus.driver && (
          <Card className="p-4 mb-6">
            <div className="flex items-center space-x-4">
              <Image
                src={trackingStatus.driver.photo}
                alt={trackingStatus.driver.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{trackingStatus.driver.name}</h3>
                <p className="text-sm text-gray-500">{trackingStatus.driver.vehicle}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Support */}
        <div className="flex justify-center">
          <Button variant="outline" className="text-otw-gold-600 border-otw-gold-600 hover:bg-otw-gold-600/10">
            <AlertCircle className="h-4 w-4 mr-2" />
            Need Help?
          </Button>
        </div>
      </Card>
    </div>
  )
}