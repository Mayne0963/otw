import type { Metadata } from "next";
import LocationsServerPage from './LocationsServerPage';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Locations | Broski's Chicken",
  description: "Find Broski's Chicken locations near you. View store hours, contact information, and directions to our restaurants.",
};

export default async function LocationsPage() {
  let locations: any[] = [];
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/locations`, {
      cache: 'no-store'
    });
    if (response.ok) {
      locations = await response.json();
    } else {
      console.error('Failed to fetch locations');
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
  }

  return <LocationsServerPage locations={locations} />;
}
