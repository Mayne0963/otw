import React from "react"
import { Card } from "../ui/card"
import { Phone, MessageSquare, Clock, CheckCircle2 } from "lucide-react"

interface Rep {
  name: string
  photo: string
  phone: string
  rating: number
}

interface TrackingStatusProps {
  status: "received" | "assigned" | "inMotion" | "completed"
  rep?: Rep
  estimatedTime?: string
}

const STATUS_STEPS = [
  { key: "received", label: "Request Received", icon: Clock },
  { key: "assigned", label: "Rep Assigned", icon: CheckCircle2 },
  { key: "inMotion", label: "In Motion", icon: Clock },
  { key: "completed", label: "Delivered", icon: CheckCircle2 }
]

export default function TrackingStatus({ status, rep, estimatedTime }: TrackingStatusProps) {
  const currentStep = STATUS_STEPS.findIndex(step => step.key === status)

  return (
    <Card className="p-6 space-y-6">
      <div className="relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2">
          <div 
            className="h-full bg-otw-gold transition-all duration-500"
            style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>
        
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index <= currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-otw-gold" : "bg-gray-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                </div>
                <span className={`mt-2 text-sm ${isActive ? "text-otw-gold" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {rep && status !== "received" && (
        <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-fadeIn">
          <img
            src={rep.photo}
            alt={rep.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{rep.name}</h3>
            <div className="flex items-center gap-4 mt-2">
              <button className="flex items-center gap-1 text-sm text-otw-red hover:text-otw-gold transition-colors">
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button className="flex items-center gap-1 text-sm text-otw-red hover:text-otw-gold transition-colors">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
          {estimatedTime && (
            <div className="text-right">
              <span className="text-sm text-gray-500">Estimated Time</span>
              <p className="font-semibold">{estimatedTime}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}