'use client';

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { useState } from 'react';
import type React from 'react';

import Link from 'next/link';
import { Trophy, Star, Truck, Utensils, Store } from 'lucide-react';

const topPerformers = [
  {
    name: 'Alex Johnson',
    role: 'Delivery Driver',
    image: '/assets/driver1.jpg',
    achievements: [
      '1000+ deliveries completed',
      '98% customer satisfaction',
      'Top rated driver 3 months in a row',
    ],
    stats: {
      deliveries: '1,234',
      rating: '4.9',
      hours: '2,500+',
    },
  },
  {
    name: 'Maria Garcia',
    role: 'Restaurant Partner',
    image: '/assets/restaurant1.jpg',
    achievements: [
      'Highest rated restaurant in downtown',
      '500+ orders per week',
      'Featured in local food magazine',
    ],
    stats: {
      deliveries: '8,567',
      rating: '4.8',
      hours: '1,800+',
    },
  },
  {
    name: 'David Chen',
    role: 'Store Manager',
    image: '/assets/store1.jpg',
    achievements: [
      'Best customer service award',
      'Increased store revenue by 40%',
      'Mentored 15+ new employees',
    ],
    stats: {
      deliveries: '3,421',
      rating: '4.9',
      hours: '3,200+',
    },
  },
];

const successStories = [
  {
    title: 'From Student to Top Earner',
    description: 'How Sarah turned her part-time delivery job into a full-time career',
    image: '/assets/success1.jpg',
    category: 'driver',
  },
  {
    title: 'Restaurant Revival',
    description: "How Tony's Pizza doubled their revenue with our platform",
    image: '/assets/success2.jpg',
    category: 'restaurant',
  },
  {
    title: 'Community Impact',
    description: 'Local store creates 20 new jobs through delivery expansion',
    image: '/assets/success3.jpg',
    category: 'retail',
  },
];

const categories = [
  { label: 'All', icon: <Trophy /> },
  { label: 'Drivers', icon: <Truck /> },
  { label: 'Restaurants', icon: <Utensils /> },
  { label: 'Retail', icon: <Store /> },
];

export default function HallOfHustlePage() {
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setSelectedCategory(newValue);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Hall of Hustle
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Celebrating our top performers and success stories
        </p>
      </div>

      {/* Top Performers Section */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl sm:text-3xl md:text-4xl font-bold">
          Top Performers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformers.map((performer) => (
            <Card key={performer.name} className="h-full">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={performer.image} alt={performer.name} />
                  <AvatarFallback>{performer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle>{performer.name}</CardTitle>
                <CardDescription>{performer.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Achievements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {performer.achievements.map((achievement) => (
                      <li key={achievement} className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-2" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {Object.entries(performer.stats).map(([key, value]) => (
                    <div key={key} className="p-2 bg-gray-50 rounded">
                      <div className="font-bold text-lg">{value}</div>
                      <div className="text-xs text-gray-600 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl sm:text-3xl md:text-4xl font-bold">
          Success Stories
        </h2>
        <div className="mb-6">
          <Tabs value={selectedCategory.toString()} onValueChange={(value) => setSelectedCategory(parseInt(value))} className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category, index) => (
                <TabsTrigger key={category.label} value={index.toString()} className="flex items-center gap-2">
                  {category.icon}
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedCategory.toString()}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {successStories.map((story) => (
                  <Card key={story.title} className="h-full flex flex-col">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="flex-grow">
                      <h3 className="mb-2 text-xl font-semibold">
                        {story.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {story.description}
                      </p>
                      <Button asChild>
                        <Link href={`/hall-of-hustle/stories/${story.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          Read More
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center p-8 bg-orange-500 text-white rounded-lg">
        <h3 className="mb-4 text-3xl font-bold">
          Be Part of the Success
        </h3>
        <p className="mb-6 text-lg opacity-90">
          Join our community and create your own success story
        </p>
        <Button asChild size="lg">
          <Link href="/signup">
            Get Started
          </Link>
        </Button>
      </div>
    </div>
  );
}
