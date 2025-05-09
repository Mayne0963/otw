import type { Metadata } from "next"
import OrderTracker from "../../components/otw/OrderTracker"

export const metadata: Metadata = {
  title: "Track Your Order | OTW",
  description: "Real-time tracking for your OTW delivery or service request.",
}

export const dynamic = "force-dynamic"

export default function TrackPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-otw-gold mb-2">Track Your Order</h1>
        <p className="text-lg text-gray-300 mb-8">
          Follow your request in real-time as it moves through Fort Wayne.
        </p>
        <OrderTracker />
      </div>
    </div>
  )
}
