'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useCart } from '../../lib/context/CartContext';
import { toast } from '../../components/ui/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
  isPopular?: boolean;
  isNew?: boolean;
  dietary: string[];
  restaurant: {
    id: string;
    name: string;
    logo: string;
  };
}

const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Signature Burger',
    description: 'Juicy beef patty with special sauce, lettuce, tomato, and cheese',
    price: 12.99,
    image: '/images/menu/burger.jpg',
    category: 'Burgers',
    rating: 4.8,
    prepTime: '15-20 min',
    isPopular: true,
    dietary: ['Gluten-Free Available'],
    restaurant: {
      id: 'broskis',
      name: "Broski's Kitchen",
      logo: '/images/restaurants/broskis-logo.png'
    }
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on crispy crust',
    price: 14.99,
    image: '/images/menu/pizza.jpg',
    category: 'Pizza',
    rating: 4.7,
    prepTime: '20-25 min',
    isNew: true,
    dietary: ['Vegetarian'],
    restaurant: {
      id: 'tonys',
      name: "Tony's Pizzeria",
      logo: '/images/restaurants/tonys-logo.png'
    }
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing',
    price: 9.99,
    image: '/images/menu/salad.jpg',
    category: 'Salads',
    rating: 4.5,
    prepTime: '10-15 min',
    dietary: ['Vegetarian', 'Gluten-Free Available'],
    restaurant: {
      id: 'greens',
      name: 'Green Garden',
      logo: '/images/restaurants/greens-logo.png'
    }
  },
  {
    id: '4',
    name: 'Chicken Tacos',
    description: 'Grilled chicken with fresh salsa, avocado, and lime',
    price: 11.99,
    image: '/images/menu/tacos.jpg',
    category: 'Mexican',
    rating: 4.6,
    prepTime: '12-18 min',
    dietary: ['Gluten-Free'],
    restaurant: {
      id: 'casa',
      name: 'Casa Mexico',
      logo: '/images/restaurants/casa-logo.png'
    }
  },
  {
    id: '5',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with creamy frosting',
    price: 6.99,
    image: '/images/menu/cake.jpg',
    category: 'Desserts',
    rating: 4.9,
    prepTime: '5-10 min',
    dietary: ['Vegetarian'],
    restaurant: {
      id: 'sweet',
      name: 'Sweet Treats',
      logo: '/images/restaurants/sweet-logo.png'
    }
  }
];

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Salads', 'Mexican', 'Desserts'];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(SAMPLE_MENU_ITEMS);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(SAMPLE_MENU_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  // Filter items based on search and category
  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, menuItems]);

  const handleAddToCart = (item: MenuItem) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      restaurant: item.restaurant.name
    };
    
    addItem(cartItem);
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const getDietaryBadgeColor = (dietary: string) => {
    switch (dietary) {
      case 'Vegan':
        return 'bg-green-500';
      case 'Vegetarian':
        return 'bg-green-400';
      case 'Gluten-Free':
      case 'Gluten-Free Available':
        return 'bg-blue-500';
      case 'Dairy-Free':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-otw-black-800 to-otw-black-900">
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-otw-gold/10 to-transparent" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-otw-gold">Menu</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover delicious dishes from Fort Wayne's best restaurants, all in one place
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-otw-black-800/50 backdrop-blur-sm rounded-2xl p-6 border border-otw-gold/20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for dishes, restaurants, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-gray-700 text-white placeholder-gray-400 focus:border-otw-gold focus:ring-2 focus:ring-otw-gold/20 rounded-xl text-lg backdrop-blur-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold shadow-lg'
                      : 'bg-transparent border-2 border-otw-gold/30 text-otw-gold hover:bg-otw-gold/10 hover:border-otw-gold'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
          </h2>
          <p className="text-gray-400">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-otw-black-800/80 to-otw-black-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-otw-gold/20 hover:border-otw-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-otw-gold/10 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
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

                  {/* Restaurant Logo */}
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.restaurant.logo || '/placeholder.svg'}
                        alt={item.restaurant.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-otw-gold text-black px-3 py-1 rounded-full font-bold text-lg">
                      ${item.price}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-otw-gold transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-400">{item.restaurant.name}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-2">{item.description}</p>

                  {/* Rating and Prep Time */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{item.rating}</span>
                      <span className="text-gray-400 text-sm">rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{item.prepTime}</span>
                    </div>
                  </div>

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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-otw-gold/10 to-transparent py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse our full selection of restaurants and discover your new favorite dish
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button className="bg-transparent border-2 border-otw-gold text-otw-gold hover:bg-otw-gold hover:text-black px-8 py-3 rounded-full transition-all duration-300">
                View All Restaurants
              </Button>
            </Link>
            <Link href="/cart">
              <Button className="bg-gradient-to-r from-otw-gold to-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all duration-300">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}