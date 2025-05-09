import type { Metadata } from "next"
import RestaurantsClientPage from "./RestaurantsClientPage"

export const metadata: Metadata = {
  title: "Restaurants | OTW",
  description: "Order food from the best restaurants in Fort Wayne, delivered by OTW.",
}

export const dynamic = "force-dynamic"

export default function RestaurantsPage() {
  return <RestaurantsClientPage />
}
