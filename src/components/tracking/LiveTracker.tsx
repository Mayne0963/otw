import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Socket } from 'socket.io-client';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/maps/MapSearch'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 animate-pulse"></div>
  ),
});

interface Location {
  lat: number;
  lng: number;
  timestamp: Date;
}

interface LiveTrackerProps {
  orderId: string;
  socket: Socket;
}

export function LiveTracker({ orderId, socket }: LiveTrackerProps) {
  const [location, setLocation] = useState<Location | null>(null);
  // Removed unused eta state

  useEffect(() => {
    socket.emit('join_tracking', orderId);

    socket.on('location_update', (data: Location) => {
      setLocation(data);
      // Calculate new ETA
    });

    return () => {
      socket.emit('leave_tracking', orderId);
      socket.off('location_update');
    };
  }, [orderId, socket]);

  return (
    <div className="rounded-lg overflow-hidden">
      <MapComponent
        onLocationSelect={() => {}}
        {...(location && { defaultLocation: { lat: location.lat, lng: location.lng } })}
        showSearchBar={false}
      />
      {/* Removed eta reference but kept conditional rendering structure for future use */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Tracking your order in real-time
        </p>
      </div>
    </div>
  );
}
