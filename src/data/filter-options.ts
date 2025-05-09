import type { Category, DietaryOption, RestaurantFeature } from "../types/restaurant"

export const restaurantCategories: Category[] = [
  { id: "all", name: "All" },
  { id: "american", name: "American" },
  { id: "pizza", name: "Pizza" },
  { id: "mexican", name: "Mexican" },
  { id: "asian", name: "Asian" },
  { id: "italian", name: "Italian" },
  { id: "healthy", name: "Healthy" },
  { id: "desserts", name: "Desserts" },
  { id: "breakfast", name: "Breakfast" },
  { id: "burgers", name: "Burgers" },
  { id: "sushi", name: "Sushi" },
  { id: "indian", name: "Indian" },
  { id: "thai", name: "Thai" },
  { id: "mediterranean", name: "Mediterranean" },
  { id: "bbq", name: "BBQ" },
  { id: "seafood", name: "Seafood" },
  { id: "vegan", name: "Vegan" },
  { id: "vegetarian", name: "Vegetarian" },
  { id: "gluten_free", name: "Gluten-Free" },
]

export const dietaryOptions: DietaryOption[] = [
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "gluten_free", name: "Gluten-Free" },
  { id: "dairy_free", name: "Dairy-Free" },
  { id: "nut_free", name: "Nut-Free" },
  { id: "keto", name: "Keto" },
  { id: "paleo", name: "Paleo" },
]

export const restaurantFeatures: RestaurantFeature[] = [
  { id: "outdoor_seating", name: "Outdoor Seating" },
  { id: "takeout", name: "Takeout" },
  { id: "delivery", name: "Delivery" },
  { id: "reservations", name: "Reservations" },
  { id: "alcohol", name: "Serves Alcohol" },
  { id: "late_night", name: "Late Night" },
  { id: "family_friendly", name: "Family Friendly" },
  { id: "live_music", name: "Live Music" },
]
