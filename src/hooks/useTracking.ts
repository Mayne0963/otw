import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from './useFirestore';
import { Tracking } from '../types/firestore';

export function useTracking(userId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTracking, setActiveTracking] = useState<Tracking | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Destructure only what we need from useFirestore
  const { setDocument, subscribeToDocument } =
    useFirestore<Tracking>('tracking');

  // Get address from coordinates using Google Maps Geocoding API
  const getAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      return data.results[0]?.formatted_address || 'Unknown location';
    } catch (err) {
      console.error('Error getting address:', err);
      return 'Unknown location';
    }
  }, []);

  // Update tracking location in Firestore
  const updateTrackingLocation = useCallback(
    async (position: GeolocationPosition) => {
      if (!activeTracking) {return;}

      try {
        await setDocument(activeTracking.id, {
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: await getAddressFromCoords(
              position.coords.latitude,
              position.coords.longitude,
            ),
          },
          updatedAt: new Date(),
        });
      } catch (err) {
        setError(err as Error);
      }
    },
    [activeTracking, setDocument, getAddressFromCoords],
  );

  // Start tracking user's location
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        if (activeTracking) {
          updateTrackingLocation(position);
        }
      },
      (error: GeolocationPositionError) => {
        // Create a proper Error object from GeolocationPositionError
        const customError = new Error(error.message);
        customError.name = 'GeolocationError';
        setError(customError);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );

    setWatchId(id);
  }, [activeTracking, updateTrackingLocation]);

  // Stop tracking user's location
  const stopLocationTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Start a new tracking session
  const startTracking = async (
    type: 'delivery' | 'service' | 'volunteer',
    destination?: {
      lat: number;
      lng: number;
      address: string;
    },
  ) => {
    try {
      if (!location) {
        throw new Error('Location not available');
      }

      const trackingId = Date.now().toString();
      const tracking: Tracking = {
        id: trackingId,
        userId,
        type,
        status: 'in_progress',
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address: await getAddressFromCoords(
            location.coords.latitude,
            location.coords.longitude,
          ),
        },
        ...(destination && { destination }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDocument(trackingId, tracking);
      setActiveTracking(tracking);
      startLocationTracking();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Update tracking status
  const updateStatus = async (
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  ) => {
    if (!activeTracking) {return;}

    try {
      await setDocument(activeTracking.id, {
        status,
        updatedAt: new Date(),
        ...(status === 'completed' && { actualArrival: new Date() }),
      });

      if (status === 'completed' || status === 'cancelled') {
        stopLocationTracking();
        setActiveTracking(null);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Subscribe to active tracking
  useEffect(() => {
    if (!userId) {return;}

    const unsubscribe = subscribeToDocument(userId, (data) => {
      setActiveTracking(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, subscribeToDocument, setActiveTracking, setLoading]);

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [stopLocationTracking]);

  return {
    loading,
    error,
    activeTracking,
    location,
    startTracking,
    updateStatus,
    stopLocationTracking,
  };
}
