"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "../../../lib/context/CartContext"
import { Star, ChevronLeft, Search, ShoppingBag } from "lucide-react"
import { menuItems, categories } from "../../../data/menu-data"
import MenuItemCard from "../../../components/menu/MenuItemCard"
import CategoryFilter from "../../../components/menu/CategoryFilter"
import type { Restaurant } from "../../../types/restaurant"
import { restaurantImages, restaurantLogos } from "../../../data/restaurants-data"

interface RestaurantDetailPageProps {
  restaurant: Restaurant
}

export default function RestaurantDetailPage({ restaurant }: RestaurantDetailPageProps) {
  // Always call hooks at the top level
  const cartContext = useCart()
  const { itemCount, addItem } = cartContext || { itemCount: 0, addItem: undefined }
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState(menuItems)

  // Get the correct image and logo based on restaurant id
  const getRestaurantImage = () => {
    const id = restaurant.id.split("-")[0]
    return restaurantImages[id as keyof typeof restaurantImages] || restaurant.image
  }

  const getRestaurantLogo = () => {
    const id = restaurant.id.split("-")[0]
    return restaurantLogos[id as keyof typeof restaurantLogos] || restaurant.logo
  }

  // Filter menu items based on selected category and search query
  useEffect(() => {
    let filtered = [...menuItems]

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    setFilteredItems(filtered)
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen pb-20">
      {/* Restaurant Header */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={getRestaurantImage() || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="container mx-auto px-4 z-10">
          <Link href="/restaurants" className="inline-flex items-center text-white hover:text-[#FFD700] mb-4">
            <ChevronLeft size={20} />
            <span>Back to restaurants</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#111111] rounded-lg overflow-hidden relative border-2 border-[#333333]">
              <Image
                src={getRestaurantLogo() || "/placeholder.svg"}
                alt={`${restaurant.name} logo`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{restaurant.name}</h1>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <div className="flex items-center text-[#FFD700]">
                  <Star size={18} fill="#FFD700" />
                  <span className="ml-1 font-medium">{restaurant.rating}</span>
                </div>
                <span className="text-gray-400">({restaurant.reviewCount} reviews)</span>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-400">{restaurant.priceLevel}</span>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-400">{restaurant.deliveryTime}</span>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-400">${restaurant.deliveryFee.toFixed(2)} delivery</span>
              </div>
              <p className="text-gray-300 mt-2">{restaurant.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-[#111111] py-8 sticky top-20 z-30 border-b border-[#333333]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search menu..."
                className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* Cart Button */}
            <Link href="/cart" className="relative">
              <button className="flex items-center gap-2 py-2 px-4 bg-[#C1272D] text-white rounded-lg hover:bg-[#A01F24]">
                <ShoppingBag size={18} />
                <span>View Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FFD700] text-black text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Items Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={(quantity, customizations) => {
                    // Add item to cart using the extracted addItem function
                    if (addItem) {
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: quantity,
                        image: item.image,
                        customizations: customizations,
                      })
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold mb-4 text-white">No items found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
              <button
                className="py-2 px-6 bg-[#C1272D] text-white rounded-lg hover:bg-[#A01F24]"
                onClick={() => {
                  setSelectedCategory("all")
                  setSearchQuery("")
                }}
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
