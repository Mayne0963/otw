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
import { menuItems, categories } from "../../data/menu-data";

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
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(menuItems);

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
    <div className="min-h-screen bg-gradient-to-b from-otw-black to-gray-900 pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-otw-red/80 to-otw-gold/80"></div>
          <div className="absolute inset-0 bg-[url('/restaurants/broskis.jpg')] bg-cover bg-center opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Broski's Kitchen
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-6">
            Luxury street gourmet cuisine delivered to your door
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white">
            <div className="flex items-center">
              <Star className="text-otw-gold mr-2 w-5 h-5" />
              <span className="font-semibold">4.8/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Clock className="text-otw-gold mr-2 w-5 h-5" />
              <span className="font-semibold">25-35 min delivery</span>
            </div>
            <div className="flex items-center">
              <MapPin className="text-otw-gold mr-2 w-5 h-5" />
              <span className="font-semibold">Fort Wayne, IN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-otw-black/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-otw-gold"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={`${
                selectedCategory === "all"
                  ? "bg-otw-red text-white"
                  : "border-gray-600 text-gray-300 hover:border-otw-gold hover:text-otw-gold"
              }`}
            >
              All Items
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? "bg-otw-red text-white"
                    : "border-gray-600 text-gray-300 hover:border-otw-gold hover:text-otw-gold"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedCategory === "all" ? "Full Menu" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-300">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
                const quantity = getCartItemQuantity(item.id);
                return (
                  <Card key={item.id} className="bg-gray-800 border-gray-700 hover:border-otw-gold/50 transition-all duration-300">
                    <div className="relative h-48">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {item.popular && (
                        <Badge className="absolute top-2 left-2 bg-otw-red text-white">
                          Popular
                        </Badge>
                      )}
                      {item.new && (
                        <Badge className="absolute top-2 right-2 bg-otw-gold text-black">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                        <span className="text-otw-gold font-bold text-lg">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4 text-sm">{item.description}</p>
                      
                      {/* Dietary badges */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.dietary.vegan && (
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            Vegan
                          </Badge>
                        )}
                        {item.dietary.vegetarian && !item.dietary.vegan && (
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            Vegetarian
                          </Badge>
                        )}
                        {item.dietary.glutenFree && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                            Gluten-Free
                          </Badge>
                        )}
                        {item.dietary.dairyFree && (
                          <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                            Dairy-Free
                          </Badge>
                        )}
                      </div>

                      {/* Add to cart controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-otw-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="border-otw-red text-otw-red hover:bg-otw-red hover:text-white w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-white font-semibold w-8 text-center">
                              {quantity}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-otw-red hover:bg-otw-red/80 w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="bg-otw-red hover:bg-otw-red/80"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Utensils className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-white">
                No items found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or category filter
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="bg-otw-red hover:bg-otw-red/80"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link href="/cart">
            <Button
              size="lg"
              className="bg-otw-red hover:bg-otw-red/80 text-white shadow-lg relative"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({getTotalItems()}) - ${getTotalPrice().toFixed(2)}
              <Badge className="absolute -top-2 -right-2 bg-otw-gold text-black">
                {getTotalItems()}
              </Badge>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}