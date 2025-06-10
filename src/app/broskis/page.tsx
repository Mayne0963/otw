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

const BROSKIS_MENU: MenuItem[] = [
  {
    id: 'signature-burger',
    name: 'Broski Signature Burger',
    description: 'Our famous double patty with special sauce, lettuce, tomato, cheese, and crispy onions',
    price: 14.99,
    image: '/images/menu/signature-burger.jpg',
    category: 'Burgers',
    isPopular: true,
    dietary: ['Gluten-Free Bun Available'],
  },
  {
    id: 'loaded-fries',
    name: 'Loaded Broski Fries',
    description: 'Crispy fries topped with cheese sauce, bacon bits, green onions, and sour cream',
    price: 9.99,
    image: '/images/menu/loaded-fries.jpg',
    category: 'Sides',
    isPopular: true,
    dietary: ['Vegetarian Option'],
  },
  {
    id: 'chicken-sandwich',
    name: 'Crispy Chicken Sandwich',
    description: 'Hand-breaded chicken breast with pickles, mayo, and coleslaw on a brioche bun',
    price: 12.99,
    image: '/images/menu/chicken-sandwich.jpg',
    category: 'Sandwiches',
    dietary: [],
  },
  {
    id: 'bbq-wings',
    name: 'BBQ Wings',
    description: 'Smoky BBQ wings served with celery sticks and blue cheese dip',
    price: 11.99,
    image: '/images/menu/bbq-wings.jpg',
    category: 'Wings',
    dietary: ['Gluten-Free'],
  },
  {
    id: 'veggie-burger',
    name: 'Garden Veggie Burger',
    description: 'House-made veggie patty with avocado, sprouts, and herb aioli',
    price: 11.99,
    image: '/images/menu/veggie-burger.jpg',
    category: 'Burgers',
    isNew: true,
    dietary: ['Vegetarian', 'Vegan Option'],
  },
  {
    id: 'milkshake',
    name: 'Broski Milkshake',
    description: 'Thick and creamy milkshake available in vanilla, chocolate, or strawberry',
    price: 5.99,
    image: '/images/menu/milkshake.jpg',
    category: 'Beverages',
    dietary: ['Vegetarian'],
  },
];

const RESTAURANT_INFO = {
  name: "Broski's Kitchen",
  description: "Fort Wayne's favorite burger joint serving up fresh, made-to-order burgers, crispy fries, and ice-cold shakes since 2018.",
  rating: 4.8,
  reviewCount: 1247,
  priceRange: '$$',
  cuisine: 'American, Burgers',
  hours: {
    'Monday': '11:00 AM - 10:00 PM',
    'Tuesday': '11:00 AM - 10:00 PM',
    'Wednesday': '11:00 AM - 10:00 PM',
    'Thursday': '11:00 AM - 10:00 PM',
    'Friday': '11:00 AM - 11:00 PM',
    'Saturday': '11:00 AM - 11:00 PM',
    'Sunday': '12:00 PM - 9:00 PM',
  },
  contact: {
    phone: '(260) 555-BROSKI',
    address: '123 Main Street, Fort Wayne, IN 46802',
    website: 'www.broskiskitchen.com',
  },
  features: [
    'Dine-in',
    'Takeout',
    'Delivery',
    'Drive-thru',
    'Outdoor Seating',
    'Family Friendly',
    'Local Favorite',
  ],
};

export default function BroskisPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredMenu, setFilteredMenu] = useState(BROSKIS_MENU);
  const router = useRouter();

  const categories = ['All', ...Array.from(new Set(BROSKIS_MENU.map(item => item.category)))];

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredMenu(BROSKIS_MENU);
    } else {
      setFilteredMenu(BROSKIS_MENU.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory]);

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
                    {RESTAURANT_INFO.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{RESTAURANT_INFO.rating}</span>
                      <span className="text-gray-400">({RESTAURANT_INFO.reviewCount} reviews)</span>
                    </div>
                    <Badge className="bg-otw-gold text-black">{RESTAURANT_INFO.priceRange}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                {RESTAURANT_INFO.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {RESTAURANT_INFO.features.map((feature) => (
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
                  {Object.entries(RESTAURANT_INFO.hours).map(([day, hours]) => (
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
                  <span>{RESTAURANT_INFO.contact.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-otw-gold mt-1" />
                  <span>{RESTAURANT_INFO.contact.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Globe className="w-4 h-4 text-otw-gold" />
                  <span>{RESTAURANT_INFO.contact.website}</span>
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
                <p className="text-gray-300 mb-4">{RESTAURANT_INFO.cuisine}</p>
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