import type { Metadata } from "next"
import { restaurants } from "../../../data/restaurants-data"
import RestaurantDetailPage from "./RestaurantDetailPage"
import { notFound } from "next/navigation"

interface RestaurantPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const restaurant = restaurants.find((r) => r.id === params.id)

  if (!restaurant) {
    return {
      title: "Restaurant Not Found | OTW",
      description: "The restaurant you're looking for could not be found.",
    }
  }

  return {
    title: `${restaurant.name} | OTW Food Delivery`,
    description: restaurant.description,
  }
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = restaurants.find((r) => r.id === params.id)

  if (!restaurant) {
    notFound()
  }

  return <RestaurantDetailPage restaurant={restaurant} />
}

export const dynamic = "force-dynamic"
