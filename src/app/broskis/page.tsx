'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  Globe,
  Heart,
  Award,
  Users,
  Utensils,
  ChefHat,
  Coffee,
  Truck,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from '../../components/ui/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isNew?: boolean;
  dietary: string[];
}

interface RestaurantInfo {
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  cuisine: string;
  hours: Record<string, string>;
  contact: {
    phone: string;
    address: string;
    website: string;
  };
  features: string[];
}

export default function BroskisPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const categories = ['All', ...Array.from(new Set(menu.map(item => item.category)))];

  // Fetch restaurant data and menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch restaurant info and menu from API
        const [restaurantResponse, menuResponse] = await Promise.all([
          fetch('/api/restaurants/broskis'),
          fetch('/api/restaurants/broskis/menu')
        ]);

        if (!restaurantResponse.ok || !menuResponse.ok) {
          throw new Error('Failed to fetch restaurant data');
        }

        const restaurantData = await restaurantResponse.json();
        const menuData = await menuResponse.json();

        if (restaurantData.success && restaurantData.data) {
          setRestaurantInfo(restaurantData.data);
        }

        if (menuData.success && menuData.data) {
          setMenu(menuData.data);
        }
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError('Failed to load restaurant information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredMenu(menu);
    } else {
      setFilteredMenu(menu.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, menu]);

  const handleAddToCart = (item: MenuItem) => {
    const orderItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      restaurant: "Broski's Kitchen",
    };

    router.push(`/checkout?item=${encodeURIComponent(JSON.stringify(orderItem))}`);
  };

  const getDietaryBadgeColor = (dietary: string) => {
    switch (dietary) {
      case 'Vegan':
      case 'Vegan Option':
        return 'bg-green-500';
      case 'Vegetarian':
      case 'Vegetarian Option':
        return 'bg-green-400';
      case 'Gluten-Free':
      case 'Gluten-Free Bun Available':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-otw-gold animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading restaurant information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No restaurant info
  if (!restaurantInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Restaurant information not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Restaurant Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    {restaurantInfo.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{restaurantInfo.rating}</span>
                      <span className="text-gray-400">({restaurantInfo.reviewCount} reviews)</span>
                    </div>
                    <Badge className="bg-otw-gold text-black">{restaurantInfo.priceRange}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                {restaurantInfo.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {restaurantInfo.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="border-otw-gold/30 text-otw-gold">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                  <Truck className="w-5 h-5 mr-2" />
                  Order for Delivery
                </Button>
                <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                  <Phone className="w-5 h-5 mr-2" />
                  Call to Order
                </Button>
              </div>
            </div>

            {/* Restaurant Image */}
            <div className="flex-1 max-w-lg">
              <div className="relative h-80 rounded-2xl overflow-hidden">
                <Image
                  src="/images/restaurants/broskis-interior.jpg"
                  alt="Broski's Kitchen Interior"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Hours */}
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-otw-gold" />
                  Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(restaurantInfo.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-gray-300">
                      <span className="font-medium">{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-otw-gold" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone className="w-4 h-4 text-otw-gold" />
                  <span>{restaurantInfo.contact.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-otw-gold mt-1" />
                  <span>{restaurantInfo.contact.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Globe className="w-4 h-4 text-otw-gold" />
                  <span>{restaurantInfo.contact.website}</span>
                </div>
              </CardContent>
            </Card>

            {/* Cuisine */}
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-otw-gold" />
                  Cuisine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{restaurantInfo.cuisine}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-otw-gold" />
                    <span className="text-gray-300 text-sm">Family Friendly</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300 text-sm">Local Favorite</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="text-otw-gold">Menu</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Fresh ingredients, bold flavors, and generous portions - that's the Broski's way
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold'
                    : 'bg-transparent border-2 border-otw-gold/30 text-otw-gold hover:bg-otw-gold/10 hover:border-otw-gold'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map((item) => (
              <Card key={item.id} className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-otw-gold/10 group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {item.isPopular && (
                      <Badge className="bg-red-500 text-white px-3 py-1 text-xs font-semibold">
                        🔥 Popular
                      </Badge>
                    )}
                    {item.isNew && (
                      <Badge className="bg-green-500 text-white px-3 py-1 text-xs font-semibold">
                        ✨ New
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-otw-gold text-black px-3 py-1 rounded-full font-bold text-lg">
                      ${item.price}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-otw-gold transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-2">{item.description}</p>

                  {/* Dietary Badges */}
                  {item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.dietary.map((diet, index) => (
                        <Badge
                          key={index}
                          className={`${getDietaryBadgeColor(diet)} text-white px-2 py-1 text-xs`}
                        >
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-otw-gold/20 transition-all duration-300 group-hover:scale-105"
                  >
                    Add to Cart • ${item.price}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Awards & <span className="text-otw-gold">Recognition</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-white font-bold mb-2">Best Burger 2023</h3>
              <p className="text-gray-400">Fort Wayne Food Awards</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-white font-bold mb-2">People's Choice</h3>
              <p className="text-gray-400">Local Restaurant Week</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-white font-bold mb-2">Community Favorite</h3>
              <p className="text-gray-400">3 Years Running</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the best burgers in Fort Wayne. Order now for pickup or delivery!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                View Full Menu
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}