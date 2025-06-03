'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Utensils, 
  Users, 
  Clock,
  Phone,
  Mail,
  Star,
  CheckCircle,
  ChefHat,
  Truck,
  Calendar,
  MapPin,
  Heart,
  Leaf,
  Zap,
  Award,
  Coffee,
  Pizza,
  Cake,
  Salad
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '../../components/ui/use-toast';
import { useCart } from '../../lib/context/CartContext';

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

const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'breakfast-basic',
    name: 'Continental Breakfast',
    description: 'Perfect start to your morning event with fresh pastries and coffee',
    pricePerPerson: 12,
    minGuests: 10,
    category: 'breakfast',
    features: [
      'Assorted pastries and muffins',
      'Fresh fruit platter',
      'Premium coffee and tea service',
      'Orange juice and water',
      'Disposable plates and utensils',
      'Setup and cleanup included'
    ]
  },
  {
    id: 'lunch-deluxe',
    name: 'Executive Lunch',
    description: 'Professional lunch service perfect for corporate events',
    pricePerPerson: 18,
    minGuests: 15,
    category: 'lunch',
    features: [
      'Choice of 3 gourmet sandwiches',
      'Mixed green salad',
      'Seasonal soup',
      'Chips and pickles',
      'Dessert selection',
      'Beverages included',
      'Professional service staff'
    ],
    popular: true
  },
  {
    id: 'dinner-premium',
    name: 'Premium Dinner Service',
    description: 'Elegant multi-course dinner for special occasions',
    pricePerPerson: 45,
    minGuests: 20,
    category: 'dinner',
    features: [
      'Three-course plated dinner',
      'Choice of premium entrees',
      'Seasonal vegetables',
      'Artisan bread service',
      'Signature dessert',
      'Wine pairing available',
      'White-glove service',
      'Linens and centerpieces'
    ],
    premium: true
  },
  {
    id: 'dessert-station',
    name: 'Dessert Station',
    description: 'Sweet endings for any celebration',
    pricePerPerson: 8,
    minGuests: 10,
    category: 'dessert',
    features: [
      'Assorted mini desserts',
      'Fresh fruit display',
      'Chocolate fountain',
      'Coffee and tea service',
      'Decorative presentation',
      'Serving utensils included'
    ]
  },
  {
    id: 'beverage-package',
    name: 'Premium Beverage Service',
    description: 'Complete beverage solutions for your event',
    pricePerPerson: 15,
    minGuests: 15,
    category: 'beverages',
    features: [
      'Open bar service (4 hours)',
      'Premium spirits and wines',
      'Craft beer selection',
      'Signature cocktails',
      'Non-alcoholic options',
      'Professional bartender',
      'All glassware included'
    ]
  }
];

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'gourmet-sandwich-platter',
    name: 'Gourmet Sandwich Platter',
    description: 'Assorted premium sandwiches with artisan breads and fresh ingredients',
    price: 89,
    category: 'Lunch',
    dietary: ['Vegetarian Options'],
    image: '/images/catering/sandwich-platter.jpg',
    servingSize: 'Serves 8-10',
    prepTime: '2 hours notice'
  },
  {
    id: 'mediterranean-mezze',
    name: 'Mediterranean Mezze Board',
    description: 'Hummus, olives, cheese, crackers, and fresh vegetables',
    price: 65,
    category: 'Appetizers',
    dietary: ['Vegetarian', 'Gluten-Free Options'],
    image: '/images/catering/mezze-board.jpg',
    servingSize: 'Serves 6-8',
    prepTime: '4 hours notice'
  },
  {
    id: 'bbq-platter',
    name: 'BBQ Feast Platter',
    description: 'Pulled pork, brisket, ribs with sides and sauces',
    price: 145,
    category: 'Dinner',
    dietary: ['Gluten-Free Sides'],
    image: '/images/catering/bbq-platter.jpg',
    servingSize: 'Serves 10-12',
    prepTime: '24 hours notice'
  },
  {
    id: 'breakfast-pastry-box',
    name: 'Breakfast Pastry Box',
    description: 'Fresh croissants, muffins, and danish pastries',
    price: 45,
    category: 'Breakfast',
    dietary: ['Vegetarian'],
    image: '/images/catering/pastry-box.jpg',
    servingSize: 'Serves 6-8',
    prepTime: '1 day notice'
  },
  {
    id: 'salad-bar-setup',
    name: 'Build-Your-Own Salad Bar',
    description: 'Complete salad station with fresh greens, toppings, and dressings',
    price: 12,
    category: 'Lunch',
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    image: '/images/catering/salad-bar.jpg',
    servingSize: 'Per person',
    prepTime: '4 hours notice'
  },
  {
    id: 'dessert-tower',
    name: 'Dessert Tower',
    description: 'Tiered display of assorted mini desserts and sweets',
    price: 95,
    category: 'Desserts',
    dietary: ['Vegetarian', 'Some Gluten-Free'],
    image: '/images/catering/dessert-tower.jpg',
    servingSize: 'Serves 12-15',
    prepTime: '48 hours notice'
  }
];

export default function CateringPage() {
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
    additionalRequests: ''
  });

  const { addItem } = useCart();

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'dessert', 'beverages'];
  const menuCategories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Appetizers', 'Desserts'];

  const filteredPackages = selectedCategory === 'all' 
    ? CATERING_PACKAGES 
    : CATERING_PACKAGES.filter(pkg => pkg.category === selectedCategory);

  const [selectedMenuCategory, setSelectedMenuCategory] = useState('All');
  const filteredMenuItems = selectedMenuCategory === 'All'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === selectedMenuCategory);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Catering Quote Requested!",
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
        additionalRequests: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurant: 'OTW Catering',
      image: item.image,
      customizations: []
    });
    
    toast({
      title: "Added to Cart!",
      description: `${item.name} has been added to your cart.`,
    });
  };

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
                Exceptional culinary experiences delivered to your event. From intimate gatherings to large celebrations, we bring restaurant-quality food to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowQuoteForm(true)}
                  className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Get Catering Quote
                </Button>
                <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
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
              <h3 className="text-xl font-semibold text-white mb-2">Delivery & Setup</h3>
              <p className="text-gray-300 text-sm">Full-service delivery with professional setup and presentation</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Event Staffing</h3>
              <p className="text-gray-300 text-sm">Professional servers and bartenders for your event</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Dietary Options</h3>
              <p className="text-gray-300 text-sm">Vegetarian, vegan, gluten-free, and allergy-friendly options</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-otw-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quality Guarantee</h3>
              <p className="text-gray-300 text-sm">Fresh ingredients and restaurant-quality preparation</p>
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
                variant={selectedCategory === category ? "default" : "outline"}
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
            {filteredPackages.map((pkg) => (
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
                  <CardTitle className="text-xl text-white mb-2">{pkg.name}</CardTitle>
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
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setFormData(prev => ({ ...prev, eventType: pkg.name }));
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
            ))}
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
                variant={selectedMenuCategory === category ? "default" : "outline"}
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
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-otw-gold/10">
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
                    <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    <span className="text-2xl font-bold text-otw-gold">${item.price}</span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.dietary.map((diet, index) => (
                      <Badge key={index} variant="outline" className="border-green-400 text-green-400 text-xs">
                        {diet}
                      </Badge>
                    ))}
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
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "The catering for our corporate event was exceptional. Every dish was perfectly prepared and beautifully presented."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-otw-gold rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">MJ</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Maria Johnson</p>
                    <p className="text-gray-400 text-sm">Corporate Event Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Outstanding service and delicious food! They accommodated all our dietary restrictions perfectly."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-otw-gold rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">DL</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">David Lee</p>
                    <p className="text-gray-400 text-sm">Wedding Coordinator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm border border-otw-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  "Professional, reliable, and the food was absolutely amazing. Will definitely use them again!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-otw-gold rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">SK</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Sarah Kim</p>
                    <p className="text-gray-400 text-sm">Birthday Party Host</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                Tell us about your event and we'll create a custom catering quote
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
                    <label className="block text-white mb-2">Phone Number *</label>
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
                    <label className="block text-white mb-2">Event Date *</label>
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
                    <label className="block text-white mb-2">Guest Count *</label>
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
                    <label className="block text-white mb-2">Budget Range</label>
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
                  <label className="block text-white mb-2">Dietary Restrictions</label>
                  <Input
                    name="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleInputChange}
                    className="bg-otw-black-800 border-otw-gold/30 text-white"
                    placeholder="Vegetarian, gluten-free, allergies, etc."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Additional Requests</label>
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
            Let our culinary team create an unforgettable dining experience for your guests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowQuoteForm(true)}
              className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
            >
              Get Custom Quote
            </Button>
            <Link href="/private-events">
              <Button variant="outline" className="border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                View Event Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}