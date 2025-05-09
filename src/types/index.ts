<<<<<<< HEAD
// User types
export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

// Auth types
export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// Cart types
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  customizations?: {
    [categoryId: string]: CustomizationOption[]
  }
}

export interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  tax: number
  total: number
  itemCount: number
  loading: boolean
  error: string | null
}

// Delivery types
export interface DeliveryAddress {
  street: string
  city: string
  state: string
  zipCode: string
}

export interface DeliveryContextType {
  deliveryAddress: DeliveryAddress | null
  isDelivery: boolean
  estimatedTime: string | null
  setDeliveryAddress: (address: DeliveryAddress) => void
  setIsDelivery: (isDelivery: boolean) => void
  setEstimatedTime: (time: string) => void
  clearDeliveryInfo: () => void
}

// Media player types
export interface Track {
  id: string
  title: string
  artist: string
  url: string
  coverImage?: string
}

export interface MediaPlayerContextType {
  isPlaying: boolean
  currentTrack: Track | null
  volume: number
  playlist: Track[]
  playTrack: (track: Track) => void
  pauseTrack: () => void
  nextTrack: () => void
  previousTrack: () => void
  setVolume: (volume: number) => void
  addToPlaylist: (track: Track) => void
  removeFromPlaylist: (id: string) => void
}

// Rewards types
export interface RewardHistory {
  id: string
  date: string
  action: string
  points: number
}

export interface RewardsContextType {
  points: number
  addPoints: (points: number) => void
  redeemPoints: (points: number) => void
  history: RewardHistory[]
  loading: boolean
  error: string | null
}

// Chat types
export interface ChatMessage {
  role: "user" | "assistant"
  text: string
}

export interface ChatContextType {
  messages: ChatMessage[]
  sendMessage: (message: string) => Promise<void>
  isLoading: boolean
  clearChat: () => void
}

// Age verification types
export interface AgeVerificationContextType {
  ageVerified: boolean
  verifyAge: (month: number, year: number) => Promise<boolean>
  isVerifying: boolean
  error: string | null
}

// Customization option types
export interface CustomizationOption {
  id: string
  name: string
  price: number
}

export interface CustomizationCategory {
  id: string
  name: string
  required: boolean
  multiple: boolean
  options: CustomizationOption[]
}
=======
// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "user" | "admin"
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    notifications: boolean
    emailNotifications: boolean
  }
  notificationSettings: {
    email: boolean
    push: boolean
    marketing: boolean
    updates: boolean
  }
  activityHistory: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    metadata?: Record<string, any>
  }>
  savedItems: Array<{
    id: string
    type: string
    itemId: string
    timestamp: string
    metadata?: Record<string, any>
  }>
  createdAt: string
  updatedAt: string
}

// Service Types
export interface Service {
  id: string
  type: "food" | "grocery" | "ride" | "roadside" | "moving"
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
  pickupLocation: Location
  dropoffLocation: Location
  urgency: "standard" | "priority" | "emergency"
  preferredRep?: string
  itemDetails?: string
  photos?: string[]
  createdAt: string
  updatedAt: string
}

// Location Type
export interface Location {
  address: string
  coordinates: {
    lat: number
    lng: number
  }
}

// Menu Item Type
export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  addons?: {
    name: string
    price: number
  }[]
}

// Order Type
export interface Order {
  id: string
  userId: string
  items: {
    menuItemId: string
    quantity: number
    addons?: string[]
  }[]
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  total: number
  createdAt: string
  updatedAt: string
}

// Volunteer Type
export interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  area: string
  availability: {
    days: string[]
    hours: string[]
  }
  hoursServed: number
  tierDiscount: number
  isTierMember: boolean
}

// Partner Type
export interface Partner {
  id: string
  name: string
  type: "restaurant" | "store" | "service"
  address: Location
  menu?: MenuItem[]
  deliveryRadius: number
  isActive: boolean
}

// Tier Membership Type
export interface TierMembership {
  id: string
  userId: string
  level: "Bronze" | "Silver" | "Gold"
  price: number
  benefits: string[]
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface AuthError {
  code: string
  message: string
  details?: Record<string, any>
}
>>>>>>> 6bb1f27412afca691af85de53f83cd4d1fa1b2f5
