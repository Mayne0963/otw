'use client';

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { MapPin, Clock, CreditCard } from 'lucide-react';

// Define menu items
const menuItems = [
  {
    id: 'luxury-burger',
    name: 'Luxury Burger',
    price: 18.99,
    description: 'Wagyu beef, truffle aioli, gold leaf, brioche bun',
    image: '/assets/images/vegan-burger.jpg',
    category: 'burgers',
    popular: true,
  },
  {
    id: 'lobster-tacos',
    name: 'Lobster Tacos',
    price: 22.99,
    description: 'Maine lobster, avocado crema, mango salsa',
    image: '/assets/images/lobster-tacos.jpg',
    category: 'tacos',
    popular: true,
  },
  {
    id: 'truffle-pasta',
    name: 'Truffle Pasta',
    price: 24.99,
    description: 'Fresh pasta with black truffle and parmesan',
    image: '/assets/images/truffle-pasta.jpg',
    category: 'pasta',
    popular: false,
  },
  {
    id: 'wagyu-steak',
    name: 'Wagyu Steak',
    price: 45.99,
    description: 'Premium wagyu beef with seasonal vegetables',
    image: '/assets/images/wagyu-steak.jpg',
    category: 'steaks',
    popular: true,
  },
];

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const router = useRouter();

  const handleOrderNow = (item: typeof menuItems[0]) => {
    // Navigate to checkout with item information
    const itemData = encodeURIComponent(JSON.stringify({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      description: item.description,
    }));
    router.push(`/checkout?item=${itemData}`);
  };

  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/order-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Order Online</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Get your favorite Broski's Kitchen dishes delivered right to your
            door.
          </p>
        </div>
      </section>

      {/* Order Form Section */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 p-8">
            <h2 className="text-2xl font-bold mb-6">Start Your Order</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Enter your delivery address"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Delivery Time</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">As soon as possible</SelectItem>
                      <SelectItem value="30min">In 30 minutes</SelectItem>
                      <SelectItem value="60min">In 1 hour</SelectItem>
                      <SelectItem value="90min">In 1.5 hours</SelectItem>
                      <SelectItem value="120min">In 2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/menu" className="flex-1">
                <Button className="w-full">Browse Menu</Button>
              </Link>
              <Link href="/cart" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Popular Items
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-otw-gold transition-all duration-300">
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.popular && (
                    <div className="absolute top-2 right-2 bg-otw-gold text-black text-xs px-2 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <span className="text-otw-gold font-bold">${item.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => handleOrderNow(item)}
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/menu">
              <Button size="lg">View Full Menu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Order Info Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Order Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Delivery Times</h3>
              <p className="text-gray-400 mb-4">
                We deliver within a 5-mile radius of our locations. Average
                delivery time is 30-45 minutes depending on distance and order
                volume.
              </p>
              <p className="text-gray-400">
                <strong>Hours:</strong> 11am - 10pm Daily
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Payment Options</h3>
              <p className="text-gray-400 mb-4">
                We accept all major credit cards, digital wallets, and cash on
                delivery. All payments are secure and encrypted.
              </p>
              <p className="text-gray-400">
                <strong>Minimum Order:</strong> $15 for delivery
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-otw-red" />
              </div>
              <h3 className="text-xl font-bold mb-3">Delivery Area</h3>
              <p className="text-gray-400 mb-4">
                We currently deliver to all of Fort Wayne and select surrounding
                areas. Enter your address to confirm delivery availability.
              </p>
              <p className="text-gray-400">
                <strong>Delivery Fee:</strong> $3.99 (Free for orders over $50)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Checkout Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Order?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Browse our full menu and order your favorite items directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="bg-otw-gold text-black hover:bg-yellow-600">
                  Browse Full Menu
                </Button>
              </Link>
              <Link href="/checkout">
                <Button size="lg" variant="outline">
                  Go to Checkout
                </Button>
              </Link>
            </div>
          </div>

          {/* Tier Membership Section */}
          <div className="bg-gradient-to-r from-otw-gold to-yellow-600 rounded-lg p-8 text-center mt-8">
            <h2 className="text-3xl font-bold text-black mb-4">Join Our Tier Membership</h2>
            <p className="text-black/80 mb-6 max-w-2xl mx-auto">
              Unlock exclusive benefits, priority reservations, and special discounts with our premium membership program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tier">
                <Button size="lg">Learn About Tier Membership</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
