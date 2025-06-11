'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Users,
  Clock,
  Phone,
  Star,
  CheckCircle,
  ChefHat,
  Truck,
  Leaf,
  Award,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '../../components/ui/use-toast';
import { useRouter } from 'next/navigation';
import TestimonialsSection from '../../components/testimonials/TestimonialsSection';

interface CateringPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minGuests: number;
  features: string[];
  popular?: boolean;
  premium?: boolean;
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'beverages';
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: string[];
  image: string;
  servingSize: string;
  prepTime: string;
}

// Dynamic state will replace static data

export default function CateringPage() {
  // Dynamic state for data
  const [cateringPackages, setCateringPackages] = useState<CateringPackage[]>(
    [],
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    eventType: '',
    budget: '',
    dietaryRestrictions: '',
    additionalRequests: '',
  });

  // Fetch catering data
  useEffect(() => {
    const fetchCateringData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch catering packages and menu items in parallel
        const [packagesResponse, menuResponse] = await Promise.all([
          fetch('/api/catering/packages'),
          fetch('/api/catering/menu'),
        ]);

        if (!packagesResponse.ok) {
          throw new Error('Failed to fetch catering packages');
        }
        if (!menuResponse.ok) {
          throw new Error('Failed to fetch catering menu');
        }

        const packagesData = await packagesResponse.json();
        const menuData = await menuResponse.json();

        // Ensure we have arrays from the API response
        const packages = Array.isArray(packagesData)
          ? packagesData
          : packagesData?.packages && Array.isArray(packagesData.packages)
            ? packagesData.packages
            : [];
        const items = Array.isArray(menuData)
          ? menuData
          : menuData?.menuItems && Array.isArray(menuData.menuItems)
            ? menuData.menuItems
            : [];

        setCateringPackages(packages);
        setMenuItems(items);
      } catch (err) {
        console.error('Error fetching catering data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load catering information',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCateringData();
  }, []);

  const router = useRouter();

  const handleOrderNow = (item: MenuItem) => {
    router.push(`/checkout?item=${encodeURIComponent(JSON.stringify(item))}`);
  };

  const categories = [
    'all',
    'breakfast',
    'lunch',
    'dinner',
    'dessert',
    'beverages',
  ];
  const menuCategories = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Appetizers',
    'Desserts',
  ];

  // Ensure arrays are always valid before filtering with comprehensive safety checks
  const safePackages = React.useMemo(() => {
    try {
      if (Array.isArray(cateringPackages)) {return cateringPackages;}
      if (
        cateringPackages &&
        typeof cateringPackages === 'object' &&
        Array.isArray(cateringPackages.data)
      ) {
        return cateringPackages.data;
      }
      return [];
    } catch (error) {
      console.error('Error processing catering packages:', error);
      return [];
    }
  }, [cateringPackages]);

  const safeMenuItems = React.useMemo(() => {
    try {
      if (Array.isArray(menuItems)) {return menuItems;}
      if (
        menuItems &&
        typeof menuItems === 'object' &&
        Array.isArray(menuItems.data)
      ) {
        return menuItems.data;
      }
      return [];
    } catch (error) {
      console.error('Error processing menu items:', error);
      return [];
    }
  }, [menuItems]);

  // Filter packages with additional safety checks
  const filteredPackages = React.useMemo(() => {
    try {
      if (!Array.isArray(safePackages)) {return [];}
      return selectedCategory === 'all'
        ? safePackages
        : safePackages.filter(
            (pkg) =>
              pkg &&
              typeof pkg === 'object' &&
              pkg.category === selectedCategory,
          );
    } catch (error) {
      console.error('Error filtering packages:', error);
      return [];
    }
  }, [safePackages, selectedCategory]);

  const [selectedMenuCategory, setSelectedMenuCategory] = useState('All');

  // Filter menu items with additional safety checks
  const filteredMenuItems = React.useMemo(() => {
    try {
      if (!Array.isArray(safeMenuItems)) {return [];}
      return selectedMenuCategory === 'All'
        ? safeMenuItems
        : safeMenuItems.filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              item.category === selectedMenuCategory,
          );
    } catch (error) {
      console.error('Error filtering menu items:', error);
      return [];
    }
  }, [safeMenuItems, selectedMenuCategory]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Catering Quote Requested!',
        description: "We'll contact you within 24 hours with a detailed quote.",
      });

      setShowQuoteForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        guestCount: '',
        eventType: '',
        budget: '',
        dietaryRestrictions: '',
        additionalRequests: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit quote request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    handleOrderNow({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurant: 'OTW Catering',
      image: item.image,
      customizations: [],
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-otw-gold animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading catering information...</p>
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
          <h2 className="text-2xl font-bold text-white mb-2">
            Oops! Something went wrong
          </h2>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="w-20 h-20 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <ChefHat className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Premium <span className="text-otw-gold">Catering</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Exceptional culinary experiences delivered to your event. From
                intimate gatherings to large celebrations, we bring
                restaurant-quality food to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowQuoteForm(true)}
                  className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Get Catering Quote
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call (260) 555-FOOD
                </Button>
              </div>
            </div>

            <div className="flex-1 max-w-lg">
              <div className="relative h-80 rounded-2xl overflow-hidden">
                <Image
                  src="/images/catering/catering-hero.jpg"
                  alt="Premium Catering Setup"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our <span className="text-otw-gold">Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive catering solutions for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Delivery & Setup
              </h3>
              <p className="text-gray-300 text-sm">
                Full-service delivery with professional setup and presentation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Event Staffing
              </h3>
              <p className="text-gray-300 text-sm">
                Professional servers and bartenders for your event
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Dietary Options
              </h3>
              <p className="text-gray-300 text-sm">
                Vegetarian, vegan, gluten-free, and allergy-friendly options
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Quality Guarantee
              </h3>
              <p className="text-gray-300 text-sm">
                Fresh ingredients and restaurant-quality preparation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Catering Packages */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Catering <span className="text-otw-gold">Packages</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Pre-designed packages for easy ordering, or customize your own
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-otw-gold to-yellow-500 text-black'
                    : 'border-otw-gold/30 text-otw-gold hover:bg-otw-gold/10'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(filteredPackages) && filteredPackages.length > 0 ? (
              filteredPackages
                .filter((pkg) => pkg && pkg.id)
                .map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl hover:shadow-otw-gold/10 relative ${
                      selectedPackage === pkg.id
                        ? 'border-otw-gold/60 shadow-lg shadow-otw-gold/20 scale-105'
                        : 'border-otw-gold/20 hover:border-otw-gold/40'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold">
                          🔥 Most Popular
                        </Badge>
                      </div>
                    )}
                    {pkg.premium && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold">
                          ✨ Premium
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <CardTitle className="text-xl text-white mb-2">
                        {pkg.name}
                      </CardTitle>
                      <CardDescription className="text-gray-300 mb-4">
                        {pkg.description}
                      </CardDescription>
                      <div className="text-3xl font-bold text-otw-gold mb-2">
                        ${pkg.pricePerPerson}
                        <span className="text-sm text-gray-400">/person</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Minimum {pkg.minGuests} guests
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {Array.isArray(pkg.features) &&
                        pkg.features.length > 0 ? (
                          pkg.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-gray-300"
                            >
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm">
                              Package details available upon request
                            </span>
                          </li>
                        )}
                      </ul>

                      <Button
                        onClick={() => {
                          setSelectedPackage(pkg.id);
                          setFormData((prev) => ({
                            ...prev,
                            eventType: pkg.name,
                          }));
                          setShowQuoteForm(true);
                        }}
                        className={`w-full py-3 rounded-xl transition-all duration-300 ${
                          pkg.premium
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/20'
                            : 'bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold hover:shadow-lg hover:shadow-otw-gold/20'
                        }`}
                      >
                        Select Package
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-10 h-10 text-otw-gold/60" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Menu Items Available
                </h3>
                <p className="text-gray-400 mb-6">
                  {selectedMenuCategory === 'All'
                    ? 'No menu items are currently available. Please try again later.'
                    : `No items found for ${selectedMenuCategory}. Try selecting a different category.`}
                </p>
                <Button
                  onClick={() => setSelectedMenuCategory('All')}
                  variant="outline"
                  className="border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black"
                >
                  View All Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              À La Carte <span className="text-otw-gold">Menu</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Build your own catering order with individual menu items
            </p>
          </div>

          {/* Menu Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {menuCategories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedMenuCategory(category)}
                variant={
                  selectedMenuCategory === category ? 'default' : 'outline'
                }
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedMenuCategory === category
                    ? 'bg-gradient-to-r from-otw-gold to-yellow-500 text-black'
                    : 'border-otw-gold/30 text-otw-gold hover:bg-otw-gold/10'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(filteredMenuItems) &&
            filteredMenuItems.length > 0 ? (
              filteredMenuItems
                .filter((item) => item && item.id)
                .map((item) => (
                  <Card
                    key={item.id}
                    className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10"
                  >
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-otw-gold text-black font-semibold">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {item.name}
                        </h3>
                        <span className="text-2xl font-bold text-otw-gold">
                          ${item.price}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm mb-4">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(item.dietary) &&
                        item.dietary.length > 0 ? (
                          item.dietary.map((diet, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-green-400 text-green-400 text-xs"
                            >
                              {diet}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-gray-400 text-gray-400 text-xs"
                          >
                            Standard
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {item.servingSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.prepTime}
                        </span>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-10 h-10 text-otw-gold/60" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Packages Available
                </h3>
                <p className="text-gray-400 mb-6">
                  {selectedCategory === 'all'
                    ? 'No catering packages are currently available. Please try again later.'
                    : `No packages found for ${selectedCategory}. Try selecting a different category.`}
                </p>
                <Button
                  onClick={() => setSelectedCategory('all')}
                  variant="outline"
                  className="border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black"
                >
                  View All Categories
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 bg-gradient-to-r from-otw-gold/5 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Client <span className="text-otw-gold">Reviews</span>
            </h2>
          </div>
          
          <TestimonialsSection limit={3} featured={true} serviceType="catering" />
        </div>
      </div>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gradient-to-br from-otw-black-800 to-otw-black-900 border border-otw-gold/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Get Catering Quote</span>
                <Button
                  variant="ghost"
                  onClick={() => setShowQuoteForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Tell us about your event and we&apos;ll create a custom catering
                quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuote} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Full Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="(260) 555-0123"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">
                      Event Date *
                    </label>
                    <Input
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">
                      Guest Count *
                    </label>
                    <Input
                      name="guestCount"
                      type="number"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      required
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">
                      Budget Range
                    </label>
                    <Input
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="bg-otw-black-800 border-otw-gold/30 text-white"
                      placeholder="$500 - $1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Dietary Restrictions
                  </label>
                  <Input
                    name="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleInputChange}
                    className="bg-otw-black-800 border-otw-gold/30 text-white"
                    placeholder="Vegetarian, gluten-free, allergies, etc."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Additional Requests
                  </label>
                  <Textarea
                    name="additionalRequests"
                    value={formData.additionalRequests}
                    onChange={handleInputChange}
                    className="bg-otw-black-800 border-otw-gold/30 text-white"
                    placeholder="Special menu requests, service preferences, setup requirements, etc."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 border-otw-gold/30 text-otw-gold hover:bg-otw-gold/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold"
                  >
                    Submit Quote Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Cater Your <span className="text-otw-gold">Event</span>?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Let our culinary team create an unforgettable dining experience for
            your guests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowQuoteForm(true)}
              className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
            >
              Get Custom Quote
            </Button>
            <Link href="/private-events">
              <Button
                variant="outline"
                className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300"
              >
                View Event Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
