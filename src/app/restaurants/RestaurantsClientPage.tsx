"use client"

import { useState, useEffect } from "react"
import { restaurants } from "../../data/restaurants-data"
import { restaurantCategories, dietaryOptions, restaurantFeatures } from "../../data/filter-options"
import RestaurantCard from "../../components/restaurants/RestaurantCard"
import AdvancedSearch from "../../components/restaurants/AdvancedSearch"
import type { Restaurant, RestaurantFilters } from "../../types/restaurant"

export default function RestaurantsClientPage() {
  const [filters, setFilters] = useState<RestaurantFilters>({
    search: "",
    category: "all",
    sortBy: "recommended",
    priceLevel: [],
    partnerOnly: false,
    dietaryOptions: [],
    deliveryTimeMax: null,
    distance: null,
    features: [],
  })

  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants)

  // Filter restaurants based on selected filters
  useEffect(() => {
    let filtered = [...restaurants]

    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) || restaurant.description.toLowerCase().includes(query),
      )
    }

    // Filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter((restaurant) => restaurant.categories.includes(filters.category))
    }

    // Filter by price level
    if (filters.priceLevel.length > 0) {
      filtered = filtered.filter((restaurant) => filters.priceLevel.includes(restaurant.priceLevel))
    }

    // Filter by partner only
    if (filters.partnerOnly) {
      filtered = filtered.filter((restaurant) => restaurant.isPartner)
    }

    // Filter by dietary options
    if (filters.dietaryOptions.length > 0) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.dietaryOptions &&
          filters.dietaryOptions.some((option) => restaurant.dietaryOptions.includes(option)),
      )
    }

    // Filter by delivery time
    if (filters.deliveryTimeMax !== null) {
      filtered = filtered.filter((restaurant) => {
        const maxTime = Number.parseInt(restaurant.deliveryTime.split("-")[1])
        return maxTime <= (filters.deliveryTimeMax || 0)
      })
    }

    // Filter by distance
    if (filters.distance !== null) {
      filtered = filtered.filter((restaurant) => restaurant.distance <= (filters.distance || 0))
    }

    // Filter by features
    if (filters.features.length > 0) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.features && filters.features.some((feature) => restaurant.features.includes(feature)),
      )
    }

    // Sort restaurants
    switch (filters.sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "deliveryTime":
        filtered.sort((a, b) => {
          const aTime = Number.parseInt(a.deliveryTime.split("-")[0])
          const bTime = Number.parseInt(b.deliveryTime.split("-")[0])
          return aTime - bTime
        })
        break
      case "deliveryFee":
        filtered.sort((a, b) => a.deliveryFee - b.deliveryFee)
        break
      case "distance":
        filtered.sort((a, b) => a.distance - b.distance)
        break
      default:
        // For recommended, prioritize featured and partners
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          if (a.isPartner && !b.isPartner) return -1
          if (!a.isPartner && b.isPartner) return 1
          return b.rating - a.rating
        })
    }

    setFilteredRestaurants(filtered)
  }, [filters])

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      sortBy: "recommended",
      priceLevel: [],
      partnerOnly: false,
      dietaryOptions: [],
      deliveryTimeMax: null,
      distance: null,
      features: [],
    })
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C1272D]/80 to-black/90"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?key=r1f4u')] bg-cover bg-center opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Fort Wayne Restaurants</h1>
          <p className="text-xl text-[#FFD700] max-w-2xl mx-auto">
            Order from your favorite local restaurants, delivered by OTW
          </p>
        </div>
      </section>

      {/* Advanced Search Component */}
      <AdvancedSearch
        filters={filters}
        setFilters={setFilters}
        categories={restaurantCategories}
        dietaryOptions={dietaryOptions}
        features={restaurantFeatures}
        resetFilters={resetFilters}
      />

      {/* Restaurants Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredRestaurants.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "Restaurant" : "Restaurants"}{" "}
                  Available
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold mb-4 text-white">No restaurants found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
              <button
                className="py-2 px-6 bg-[#C1272D] text-white rounded-lg hover:bg-[#A01F24]"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
