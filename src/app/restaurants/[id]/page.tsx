import type { Metadata } from "next";
import RestaurantDetailPage from "./RestaurantDetailPage";
import { notFound } from "next/navigation";

interface RestaurantPageProps {
  params: {
    id: string;
  };
}

async function getRestaurant(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/restaurants`, {
      cache: 'no-store'
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data.find((r: any) => r.id === id);
    }
    return null;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const restaurant = await getRestaurant(params.id);

  if (!restaurant) {
    return {
      title: "Restaurant Not Found | OTW",
      description: "The restaurant you're looking for could not be found.",
    };
  }

  return {
    title: `${restaurant.name} | OTW Food Delivery`,
    description: restaurant.description,
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = await getRestaurant(params.id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantDetailPage restaurant={restaurant} />;
}

export const dynamic = "force-dynamic";
