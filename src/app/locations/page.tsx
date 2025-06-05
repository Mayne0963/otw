'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from "next";
import LocationsClientPage from './LocationsClientPage';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locations | Broski's Chicken",
  description: "Find Broski's Chicken locations near you. View store hours, contact information, and directions to our restaurants.",
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        } else {
          console.error('Failed to fetch locations');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return <LocationsClientPage locations={locations} />;
}
