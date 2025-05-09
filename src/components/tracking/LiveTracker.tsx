import { useEffect, useState } from "react"
import { Map } from "../ui/map"
import { Socket } from "socket.io-client"

interface Location {
  lat: number
  lng: number
  timestamp: Date
}

interface LiveTrackerProps {
  orderId: string
  socket: Socket
}

export function LiveTracker({ orderId, socket }: LiveTrackerProps) {
  const [location, setLocation] = useState<Location | null>(null)
  const [eta, setEta] = useState<string | null>(null)

  useEffect(() => {
    socket.emit("join_tracking", orderId)

    socket.on("location_update", (data: Location) => {
      setLocation(data)
      // Calculate new ETA
    })

    return () => {
      socket.emit("leave_tracking", orderId)
      socket.off("location_update")
    }
  }, [orderId, socket])

  return (
    <div className="rounded-lg overflow-hidden">
      <Map
        center={location ? [location.lat, location.lng] : undefined}
        zoom={15}
        className="h-[400px] w-full"
      />
      {eta && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Estimated arrival: {eta}</p>
        </div>
      )}
    </div>
  )
}