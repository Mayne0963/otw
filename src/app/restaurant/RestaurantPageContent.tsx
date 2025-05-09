import { RestaurantCard } from "@/components/restaurant/RestaurantCard"
import { getFeaturedRestaurants } from "@/lib/restaurants"

export default async function RestaurantPageContent() {
  const restaurants = await getFeaturedRestaurants()
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Featured Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  )
}