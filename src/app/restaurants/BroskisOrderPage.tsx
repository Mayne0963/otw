"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Star,
  Clock,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Filter,
  Award,
  Users,
  Utensils,
} from "lucide-react";
// TODO: Remove static data import - get menu data from API

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  new?: boolean;
  dietary: {
    dairyFree: boolean;
    glutenFree: boolean;
    vegetarian: boolean;
    vegan: boolean;
  };
}

export default function BroskisOrderPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/restaurants/broskis/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        const items = data.data || [];
        setMenuItems(items);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(items.map((item: MenuItem) => item.category).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Filter menu items based on category and search
  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchQuery]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [
          ...prevCart,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
          },
        ];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.id !== itemId);
      }
    });
  };

  const getCartItemQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-otw-black pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-otw-red/90 via-otw-gold/70 to-otw-red/90 animate-pulse"></div>
          <div className="absolute inset-0 bg-[url('/restaurants/broskis.jpg')] bg-cover bg-center opacity-80 transform hover:scale-105 transition-transform duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-otw-black/60 via-transparent to-otw-black/40"></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <div className="bg-otw-black/30 backdrop-blur-sm rounded-2xl p-8 border border-otw-gold/20 shadow-2xl">
            <h1 className="text-6xl md:text-7xl font-black mb-6 text-transparent bg-gradient-to-r from-otw-gold via-yellow-300 to-otw-gold bg-clip-text animate-pulse">
              BROSKI'S KITCHEN
            </h1>
            <p className="text-2xl text-gray-100 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
              🔥 Premium Street Gourmet • Luxury Delivered 🔥
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white">
              <div className="flex items-center bg-otw-red/20 px-4 py-2 rounded-full border border-otw-gold/30">
                <Star className="text-otw-gold mr-2 w-6 h-6 animate-pulse" />
                <span className="font-bold text-lg">4.8★ Rating</span>
              </div>
              <div className="flex items-center bg-otw-red/20 px-4 py-2 rounded-full border border-otw-gold/30">
                <Clock className="text-otw-gold mr-2 w-6 h-6" />
                <span className="font-bold text-lg">25-35 min</span>
              </div>
              <div className="flex items-center bg-otw-red/20 px-4 py-2 rounded-full border border-otw-gold/30">
                <MapPin className="text-otw-gold mr-2 w-6 h-6" />
                <span className="font-bold text-lg">Fort Wayne, IN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gradient-to-r from-otw-black/80 via-gray-900/90 to-otw-black/80 backdrop-blur-sm border-y border-otw-gold/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-otw-gold to-yellow-300 bg-clip-text mb-2">
              Explore Our Menu
            </h2>
            <p className="text-gray-300 text-lg">Discover premium gourmet creations</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-otw-gold w-6 h-6" />
              <Input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-gray-700 text-white placeholder-gray-400 focus:border-otw-gold focus:ring-2 focus:ring-otw-gold/20 rounded-xl text-lg backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-otw-red to-red-600 text-white shadow-lg transform scale-105 border-otw-gold"
                  : "border-2 border-gray-600 text-gray-300 hover:border-otw-gold hover:text-otw-gold hover:bg-otw-gold/10 hover:scale-105"
              } px-6 py-3 rounded-full font-semibold transition-all duration-300`}
            >
              🍽️ All Items
            </Button>
            {categories.map((category: string) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-otw-red to-red-600 text-white shadow-lg transform scale-105 border-otw-gold"
                    : "border-2 border-gray-600 text-gray-300 hover:border-otw-gold hover:text-otw-gold hover:bg-otw-gold/10 hover:scale-105"
                } px-6 py-3 rounded-full font-semibold transition-all duration-300`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-otw-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-otw-gold via-yellow-300 to-otw-gold bg-clip-text mb-4">
              {selectedCategory === "all" ? "🍽️ FULL MENU" : `🔥 ${selectedCategory.toUpperCase()}`}
            </h2>
            <p className="text-gray-300 text-xl font-medium">
              {filteredItems.length} premium {filteredItems.length === 1 ? "creation" : "creations"} available
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredItems.map((item) => {
                const quantity = getCartItemQuantity(item.id);
                return (
                  <Card key={item.id} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-gray-700 hover:border-otw-gold hover:shadow-2xl hover:shadow-otw-gold/20 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm group">
                    <div className="relative h-56 overflow-hidden rounded-t-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-otw-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {item.popular && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-otw-red to-red-600 text-white font-bold px-3 py-1 shadow-lg animate-pulse">
                          🔥 POPULAR
                        </Badge>
                      )}
                      {item.new && (
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-otw-gold to-yellow-400 text-black font-bold px-3 py-1 shadow-lg">
                          ✨ NEW
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-2xl font-black text-white group-hover:text-otw-gold transition-colors duration-300">{item.name}</h3>
                        <span className="text-otw-gold font-black text-2xl bg-otw-black/30 px-3 py-1 rounded-full border border-otw-gold/30">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-6 text-base leading-relaxed">{item.description}</p>
                      
                      {/* Dietary badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {item.dietary.vegan && (
                          <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10 px-3 py-1 font-semibold">
                            🌱 Vegan
                          </Badge>
                        )}
                        {item.dietary.vegetarian && !item.dietary.vegan && (
                          <Badge variant="outline" className="text-green-400 border-green-400 bg-green-400/10 px-3 py-1 font-semibold">
                            🥬 Vegetarian
                          </Badge>
                        )}
                        {item.dietary.glutenFree && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400 bg-blue-400/10 px-3 py-1 font-semibold">
                            🌾 Gluten-Free
                          </Badge>
                        )}
                        {item.dietary.dairyFree && (
                          <Badge variant="outline" className="text-purple-400 border-purple-400 bg-purple-400/10 px-3 py-1 font-semibold">
                            🥛 Dairy-Free
                          </Badge>
                        )}
                      </div>

                      {/* Add to cart controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-otw-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current drop-shadow-sm" />
                          ))}
                          <span className="ml-2 text-sm font-bold text-gray-300">5.0</span>
                        </div>
                        {quantity > 0 ? (
                          <div className="flex items-center gap-3 bg-otw-black/30 rounded-full p-1 border border-otw-gold/30">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="border-otw-red text-otw-red hover:bg-otw-red hover:text-white w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110"
                            >
                              <Minus className="w-5 h-5" />
                            </Button>
                            <span className="text-white font-black text-lg w-8 text-center">
                              {quantity}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-gradient-to-r from-otw-red to-red-600 hover:from-red-600 hover:to-otw-red w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-otw-red to-red-600 hover:from-red-600 hover:to-otw-red px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-110 shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            ADD TO CART
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border-2 border-gray-700 backdrop-blur-sm">
              <div className="bg-otw-black/30 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 border-2 border-otw-gold/30">
                <Utensils className="w-20 h-20 text-otw-gold" />
              </div>
              <h3 className="text-4xl font-black mb-6 text-transparent bg-gradient-to-r from-otw-gold to-yellow-300 bg-clip-text">
                No Creations Found
              </h3>
              <p className="text-gray-300 mb-8 text-xl max-w-md mx-auto leading-relaxed">
                🔍 Try adjusting your search or explore different categories
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="bg-gradient-to-r from-otw-red to-red-600 hover:from-red-600 hover:to-otw-red px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-110 shadow-lg"
              >
                🔄 Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/cart">
            <Button
              size="lg"
              className="bg-gradient-to-r from-otw-red to-red-600 hover:from-red-600 hover:to-otw-red text-white shadow-2xl relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-110 border-2 border-otw-gold/30 backdrop-blur-sm"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              🛒 Cart ({getTotalItems()}) • ${getTotalPrice().toFixed(2)}
              <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-otw-gold to-yellow-400 text-black font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                {getTotalItems()}
              </Badge>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}