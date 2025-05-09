"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { CheckCircle, Clock, MapPin, User } from "lucide-react"

const statusSteps = [
  {
    id: "received",
    title: "Request Received",
    icon: Clock,
    description: "We've got your request",
  },
  {
    id: "assigned",
    title: "Rep Assigned",
    icon: User,
    description: "A trusted OTW rep is on the way",
  },
  {
    id: "in_motion",
    title: "In Motion",
    icon: MapPin,
    description: "Your request is being fulfilled",
  },
  {
    id: "delivered",
    title: "Delivered",
    icon: CheckCircle,
    description: "Service completed successfully",
  },
]

export default function OrderTracker() {
  const [orderId, setOrderId] = useState("")
  const [currentStatus, setCurrentStatus] = useState("received") // This would come from your backend

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement tracking lookup
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={handleTrack} className="flex gap-4">
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your order ID"
            className="flex-1"
          />
          <Button type="submit">Track</Button>
        </form>
      </Card>

      <div className="relative">
        <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-700" />

        <div className="space-y-8">
          {statusSteps.map((step, index) => {
            const isActive = statusSteps
              .slice(0, statusSteps.findIndex((s) => s.id === currentStatus) + 1)
              .map((s) => s.id)
              .includes(step.id)

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                <div
                  className={`
                  relative z-10 rounded-full p-2
                  ${isActive ? "bg-otw-gold text-black" : "bg-gray-800 text-gray-400"}
                `}
                >
                  <step.icon className="w-4 h-4" />
                </div>

                <div>
                  <h3 className={`font-semibold ${isActive ? "text-otw-gold" : "text-gray-400"}`}>{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Card className="p-6 bg-gray-900">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-otw-gold">Order Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Pickup Location</p>
              <p>123 Main St, Fort Wayne</p>
            </div>
            <div>
              <p className="text-gray-400">Dropoff Location</p>
              <p>456 Market St, Fort Wayne</p>
            </div>
            <div>
              <p className="text-gray-400">Estimated Time</p>
              <p>25-30 minutes</p>
            </div>
            <div>
              <p className="text-gray-400">OTW Rep</p>
              <p>John D.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
