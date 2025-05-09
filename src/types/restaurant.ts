export interface Restaurant {
  id: string
  name: string
  description: string
  image: string
  logo: string
  categories: string[]
  rating: number
  reviewCount: number
  priceLevel: string
  deliveryFee: number
  deliveryTime: string
  address: string
  distance: number
  isPartner: boolean
  featured?: boolean
  tags: string[]
  dietaryOptions?: string[]
  features?: string[]
}

export interface Category {
  id: string
  name: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  popular?: boolean
  new?: boolean
  dietary?: {
    vegetarian?: boolean
    vegan?: boolean
    glutenFree?: boolean
    dairyFree?: boolean
  }
}

// Update the RestaurantFilters interface with more detailed options
export interface RestaurantFilters {
  search: string
  category: string
  sortBy: "recommended" | "rating" | "deliveryTime" | "deliveryFee" | "distance"
  priceLevel: string[]
  partnerOnly: boolean
  dietaryOptions: string[]
  deliveryTimeMax: number | null
  distance: number | null
  features: string[]
}

// Add a new interface for dietary options
export interface DietaryOption {
  id: string
  name: string
}

// Add a new interface for restaurant features
export interface RestaurantFeature {
  id: string
  name: string
}
