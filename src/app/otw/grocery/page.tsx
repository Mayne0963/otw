"use client";

import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  CalendarIcon,
  Clock,
  MapPin,
  ShoppingCart,
  CreditCard,
  Info,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Search,
  Store,
  Truck,
  Timer,
  CheckCircle,
  Apple,
  Beef,
  Milk,
  Package,
} from "lucide-react";
import {
  FaShoppingCart,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaStar,
  FaHeart,
  FaSearch,
  FaFilter,
  FaStore,
  FaLeaf,
  FaSnowflake,
  FaFire,
  FaAppleAlt,
  FaBreadSlice,
  FaCheese,
  FaFish,
  FaCarrot,
  FaWineBottle,
  FaShoppingBag,
  FaTruck,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaPlus,
  FaMinus,
  FaTrash,
  FaEdit,
  FaEye,
  FaShare,
  FaDownload,
  FaPrint,
} from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

export default function GroceryPage() {
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const popularStores = [
    {
      id: "kroger",
      name: "Kroger",
      description: "Fresh produce, pantry essentials, and more",
      deliveryTime: "30-45 min",
      deliveryFee: "$2.99",
      rating: 4.8,
      image: "/images/stores/kroger.jpg",
      categories: ["Produce", "Meat & Seafood", "Dairy", "Bakery"],
    },
    {
      id: "walmart",
      name: "Walmart Supercenter",
      description: "Everyday low prices on groceries and household items",
      deliveryTime: "45-60 min",
      deliveryFee: "$3.95",
      rating: 4.6,
      image: "/images/stores/walmart.jpg",
      categories: ["Groceries", "Household", "Electronics", "Pharmacy"],
    },
    {
      id: "meijer",
      name: "Meijer",
      description: "One-stop shopping for fresh food and essentials",
      deliveryTime: "35-50 min",
      deliveryFee: "$4.95",
      rating: 4.7,
      image: "/images/stores/meijer.jpg",
      categories: ["Fresh Food", "Organic", "Baby", "Pet Supplies"],
    },
  ];

  const categories = [
    { name: "Fresh Produce", icon: Apple, color: "bg-green-500" },
    { name: "Meat & Seafood", icon: Beef, color: "bg-red-500" },
    { name: "Dairy & Eggs", icon: Milk, color: "bg-blue-500" },
    { name: "Bakery", icon: Apple, color: "bg-yellow-500" },
    { name: "Pantry", icon: Package, color: "bg-purple-500" },
    { name: "Frozen", icon: Package, color: "bg-cyan-500" },
  ];

  return (
    <div className="min-h-screen pb-20 pt-16">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-green-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url('/images/grocery-hero.jpg')" }}
          ></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-otw-gold rounded-full animate-ping"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="text-left">
              <div className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
                <Truck className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-400 text-sm font-medium">Free delivery on orders $35+</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                Fresh groceries
                <span className="block text-green-400">delivered fast</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Shop from your favorite local stores. Fresh produce, pantry essentials, and household items delivered to your door.
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center text-gray-300">
                  <Timer className="w-5 h-5 text-green-400 mr-2" />
                  <span>30-60 min delivery</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Store className="w-5 h-5 text-green-400 mr-2" />
                  <span>15+ local stores</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>Fresh guarantee</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick search form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Start shopping</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Enter delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search for products or stores"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg"
                  />
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
                  disabled={!deliveryAddress}
                >
                  Find stores near me
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Selection Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose your store</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Shop from your favorite local stores with fast delivery and fresh guarantee.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularStores.map((store) => (
              <div
                key={store.id}
                className={`relative bg-white rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  selectedStore === store.id
                    ? "border-green-500 shadow-lg scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedStore(store.id)}
              >
                {selectedStore === store.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Store className="w-16 h-16 text-gray-400" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-700">{store.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{store.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 mr-1" />
                      {store.deliveryTime}
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      {store.deliveryFee} delivery
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {store.categories.slice(0, 3).map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                    {store.categories.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{store.categories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Categories Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Shop by category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.name}
                    className="group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300"
                  >
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Shopping Form */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Complete your order</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-gray-700 font-medium">When do you need this delivered?</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal h-12">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Pick date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                    
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP (30-60 min)</SelectItem>
                        <SelectItem value="morning">Morning (8am-12pm)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                        <SelectItem value="evening">Evening (5pm-9pm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-700 font-medium">Budget Range</Label>
                  <Select>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-50">Under $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="over-200">Over $200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-gray-700 font-medium">Shopping list (optional)</Label>
                <Textarea
                  placeholder="List the items you need, or upload your shopping list. Our personal shoppers will handle the rest!"
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-xl mb-8 border border-green-500/20">
                <div className="flex items-start">
                  <Info className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How it works</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Personal shopper carefully selects fresh items</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Real-time updates and substitution approvals</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Contactless delivery to your door</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 h-12">
                  Save list for later
                </Button>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold">
                    Start shopping
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why shoppers love OTW Grocery
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the convenience of professional grocery shopping and delivery with our commitment to freshness and quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Timer className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Fast delivery</h3>
              <p className="text-gray-400">
                Get fresh groceries delivered in 30-60 minutes from your favorite stores.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Personal shoppers</h3>
              <p className="text-gray-400">
                Trained shoppers pick the freshest produce and contact you for substitutions.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Fresh guarantee</h3>
              <p className="text-gray-400">
                100% satisfaction guarantee. If you're not happy, we'll make it right.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Fair pricing</h3>
              <p className="text-gray-400">
                Same store prices plus transparent service fees. No hidden markups.
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-8 py-4">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
              </div>
              <span className="text-white font-medium">Join 5,000+ families saving time with grocery delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Membership CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl overflow-hidden shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Save More with Tier Membership
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our Tier Membership program and enjoy exclusive benefits like
              free delivery, member-only deals, and priority shopping.
            </p>
            <Link href="/tier">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                Learn About Tier Membership
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
