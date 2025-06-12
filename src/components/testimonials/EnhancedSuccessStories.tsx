'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  MapPin, 
  User, 
  Truck, 
  Package, 
  ShoppingCart, 
  Car, 
  Clock, 
  ThumbsUp, 
  Quote,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase-config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface SuccessStory {
  id: string;
  customerName: string;
  customerAvatar?: string;
  customerLocation: string;
  serviceType: 'grocery' | 'package' | 'ride' | 'restaurant' | 'pharmacy';
  rating: number;
  title: string;
  story: string;
  date: string;
  verified: boolean;
  featured: boolean;
  likes: number;
  comments: number;
  tags: string[];
  orderValue?: number;
  deliveryTime?: string;
  driverName?: string;
  images?: string[];
  helpfulVotes: number;
  userHasLiked?: boolean;
  userHasVotedHelpful?: boolean;
}

interface FilterOptions {
  serviceType: string;
  rating: string;
  dateRange: string;
  location: string;
  sortBy: string;
}

const serviceTypeIcons = {
  grocery: <ShoppingCart className="w-4 h-4" />,
  package: <Package className="w-4 h-4" />,
  ride: <Car className="w-4 h-4" />,
  restaurant: <Truck className="w-4 h-4" />,
  pharmacy: <Package className="w-4 h-4" />
};

const serviceTypeColors = {
  grocery: 'bg-green-500/20 text-green-400 border-green-500/30',
  package: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ride: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  restaurant: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  pharmacy: 'bg-red-500/20 text-red-400 border-red-500/30'
};

// Mock data - in real app, this would come from Firebase
const mockStories: SuccessStory[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    customerLocation: 'Downtown Miami',
    serviceType: 'grocery',
    rating: 5,
    title: 'Saved My Dinner Party!',
    story: 'I was hosting a dinner party and realized I forgot to buy ingredients for the main course. OTW delivered everything I needed in just 20 minutes! The driver was so professional and even helped carry the heavy bags to my kitchen. Absolutely amazing service!',
    date: '2024-01-15',
    verified: true,
    featured: true,
    likes: 47,
    comments: 12,
    tags: ['fast-delivery', 'helpful-driver', 'emergency'],
    orderValue: 89.50,
    deliveryTime: '18 minutes',
    driverName: 'Marcus',
    helpfulVotes: 23,
    userHasLiked: false,
    userHasVotedHelpful: false
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    customerLocation: 'Brickell',
    serviceType: 'ride',
    rating: 5,
    title: 'Reliable Airport Transportation',
    story: 'Needed to catch an early flight and my usual ride fell through. Booked OTW at 4 AM and the driver arrived exactly on time. Clean car, smooth ride, and got me to the airport with time to spare. Will definitely use again!',
    date: '2024-01-12',
    verified: true,
    featured: false,
    likes: 31,
    comments: 8,
    tags: ['airport', 'punctual', 'early-morning'],
    deliveryTime: '5 minutes',
    driverName: 'Elena',
    helpfulVotes: 18,
    userHasLiked: false,
    userHasVotedHelpful: false
  },
  {
    id: '3',
    customerName: 'Lisa Rodriguez',
    customerLocation: 'Coral Gables',
    serviceType: 'package',
    rating: 5,
    title: 'Last-Minute Gift Delivery',
    story: 'Forgot my mom\'s birthday and needed to send a gift urgently. OTW picked up the gift from the store and delivered it to her in perfect condition. She was so surprised and happy! Thank you for saving the day.',
    date: '2024-01-10',
    verified: true,
    featured: true,
    likes: 62,
    comments: 15,
    tags: ['gift-delivery', 'same-day', 'family'],
    deliveryTime: '45 minutes',
    driverName: 'David',
    helpfulVotes: 35,
    userHasLiked: false,
    userHasVotedHelpful: false
  },
  {
    id: '4',
    customerName: 'James Wilson',
    customerLocation: 'South Beach',
    serviceType: 'restaurant',
    rating: 4,
    title: 'Hot Food, Great Service',
    story: 'Ordered from my favorite restaurant during a busy Friday night. Despite the high demand, my food arrived hot and fresh. The driver was courteous and even waited while I found my wallet. Great experience overall!',
    date: '2024-01-08',
    verified: true,
    featured: false,
    likes: 28,
    comments: 6,
    tags: ['hot-food', 'busy-night', 'patient-driver'],
    orderValue: 45.75,
    deliveryTime: '35 minutes',
    driverName: 'Sofia',
    helpfulVotes: 14,
    userHasLiked: false,
    userHasVotedHelpful: false
  },
  {
    id: '5',
    customerName: 'Amanda Foster',
    customerLocation: 'Wynwood',
    serviceType: 'pharmacy',
    rating: 5,
    title: 'Emergency Medication Delivery',
    story: 'My elderly father ran out of his heart medication and couldn\'t leave the house. OTW picked up his prescription and delivered it within 30 minutes. The driver was so kind and understanding. This service is a lifesaver!',
    date: '2024-01-05',
    verified: true,
    featured: true,
    likes: 89,
    comments: 22,
    tags: ['emergency', 'elderly-care', 'medication', 'compassionate'],
    deliveryTime: '28 minutes',
    driverName: 'Roberto',
    helpfulVotes: 56,
    userHasLiked: false,
    userHasVotedHelpful: false
  },
  {
    id: '6',
    customerName: 'Kevin Park',
    customerLocation: 'Little Havana',
    serviceType: 'grocery',
    rating: 5,
    title: 'Weekly Grocery Hero',
    story: 'As a busy parent of three, OTW has become my weekly grocery hero. The drivers always pick the freshest produce and handle everything with care. It\'s given me back hours of my weekend to spend with my family.',
    date: '2024-01-03',
    verified: true,
    featured: false,
    likes: 43,
    comments: 11,
    tags: ['weekly-service', 'family', 'fresh-produce', 'time-saver'],
    orderValue: 127.30,
    deliveryTime: '42 minutes',
    driverName: 'Maria',
    helpfulVotes: 27,
    userHasLiked: false,
    userHasVotedHelpful: false
  }
];

export default function EnhancedSuccessStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>(mockStories);
  const [filteredStories, setFilteredStories] = useState<SuccessStory[]>(mockStories);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    serviceType: 'all',
    rating: 'all',
    dateRange: 'all',
    location: 'all',
    sortBy: 'newest'
  });

  // Load stories from Firebase (commented out for demo)
  const loadStories = async () => {
    setLoading(true);
    try {
      // In real implementation:
      // const q = query(
      //   collection(db, 'testimonials'),
      //   where('approved', '==', true),
      //   orderBy('createdAt', 'desc'),
      //   limit(50)
      // );
      // const querySnapshot = await getDocs(q);
      // const storiesData = querySnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // })) as SuccessStory[];
      // setStories(storiesData);
      
      // For demo, use mock data
      setStories(mockStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load success stories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...stories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Service type filter
    if (filters.serviceType !== 'all') {
      filtered = filtered.filter(story => story.serviceType === filters.serviceType);
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseInt(filters.rating);
      filtered = filtered.filter(story => story.rating >= minRating);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(story => new Date(story.date) >= filterDate);
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(story => 
        story.customerLocation.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
    }

    // Featured stories first
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    setFilteredStories(filtered);
  }, [stories, searchTerm, filters]);

  const handleLike = async (storyId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like stories',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Update local state immediately
      setStories(prev => prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            likes: story.userHasLiked ? story.likes - 1 : story.likes + 1,
            userHasLiked: !story.userHasLiked
          };
        }
        return story;
      }));

      // In real implementation, update Firebase
      // await updateDoc(doc(db, 'testimonials', storyId), {
      //   likes: increment(story.userHasLiked ? -1 : 1)
      // });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleHelpfulVote = async (storyId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote',
        variant: 'destructive'
      });
      return;
    }

    try {
      setStories(prev => prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            helpfulVotes: story.userHasVotedHelpful ? story.helpfulVotes - 1 : story.helpfulVotes + 1,
            userHasVotedHelpful: !story.userHasVotedHelpful
          };
        }
        return story;
      }));
    } catch (error) {
      console.error('Error updating helpful vote:', error);
    }
  };

  const handleShare = async (story: SuccessStory) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OTW Success Story: ${story.title}`,
          text: story.story.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Story link copied to clipboard'
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-600"
        )}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Award className="w-8 h-8 text-otw-gold" />
            Success Stories
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real experiences from our amazing customers across Miami
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Search stories, customers, or tags..."
                />
              </div>
              
              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Service Type</label>
                      <Select value={filters.serviceType} onValueChange={(value) => setFilters(prev => ({ ...prev, serviceType: value }))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="grocery">Grocery</SelectItem>
                          <SelectItem value="package">Package</SelectItem>
                          <SelectItem value="ride">Ride</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Rating</label>
                      <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Date Range</label>
                      <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">Past Week</SelectItem>
                          <SelectItem value="month">Past Month</SelectItem>
                          <SelectItem value="quarter">Past 3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Location</label>
                      <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="downtown">Downtown</SelectItem>
                          <SelectItem value="brickell">Brickell</SelectItem>
                          <SelectItem value="south beach">South Beach</SelectItem>
                          <SelectItem value="coral gables">Coral Gables</SelectItem>
                          <SelectItem value="wynwood">Wynwood</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="likes">Most Liked</SelectItem>
                          <SelectItem value="helpful">Most Helpful</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-400">
            Showing {filteredStories.length} of {stories.length} stories
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-otw-gold" />
            <span className="text-white text-sm">Featured stories appear first</span>
          </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-otw-gold"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors relative overflow-hidden",
                  story.featured && "border-otw-gold/50 bg-otw-gold/5"
                )}>
                  {story.featured && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-otw-gold text-black text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </div>
                    </div>
                  )}
                  
                  {story.verified && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-br-lg font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{story.customerName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {story.customerLocation}
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            {formatDate(story.date)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={serviceTypeColors[story.serviceType]}>
                          {serviceTypeIcons[story.serviceType]}
                          <span className="ml-1 capitalize">{story.serviceType}</span>
                        </Badge>
                        <div className="flex items-center gap-1">
                          {renderStars(story.rating)}
                        </div>
                      </div>
                    </div>

                    {/* Story Title */}
                    <h4 className="text-xl font-bold text-white mb-3 flex items-start gap-2">
                      <Quote className="w-5 h-5 text-otw-gold mt-1 flex-shrink-0" />
                      {story.title}
                    </h4>

                    {/* Story Content */}
                    <div className="mb-4">
                      <p className={cn(
                        "text-gray-300 leading-relaxed",
                        expandedStory !== story.id && story.story.length > 200 && "line-clamp-3"
                      )}>
                        {story.story}
                      </p>
                      {story.story.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                          className="text-otw-gold hover:text-otw-gold/80 p-0 h-auto mt-2"
                        >
                          {expandedStory === story.id ? 'Show less' : 'Read more'}
                        </Button>
                      )}
                    </div>

                    {/* Story Details */}
                    {(story.orderValue || story.deliveryTime || story.driverName) && (
                      <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {story.orderValue && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-gray-400">Order Value:</span>
                              <span className="text-white font-medium">${story.orderValue.toFixed(2)}</span>
                            </div>
                          )}
                          {story.deliveryTime && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-400">Delivery Time:</span>
                              <span className="text-white font-medium">{story.deliveryTime}</span>
                            </div>
                          )}
                          {story.driverName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-400" />
                              <span className="text-gray-400">Driver:</span>
                              <span className="text-white font-medium">{story.driverName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-gray-700/50 text-gray-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(story.id)}
                          className={cn(
                            "text-gray-400 hover:text-red-400",
                            story.userHasLiked && "text-red-400"
                          )}
                        >
                          <Heart className={cn("w-4 h-4 mr-1", story.userHasLiked && "fill-current")} />
                          {story.likes}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-blue-400"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {story.comments}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHelpfulVote(story.id)}
                          className={cn(
                            "text-gray-400 hover:text-green-400",
                            story.userHasVotedHelpful && "text-green-400"
                          )}
                        >
                          <ThumbsUp className={cn("w-4 h-4 mr-1", story.userHasVotedHelpful && "fill-current")} />
                          Helpful ({story.helpfulVotes})
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(story)}
                        className="text-gray-400 hover:text-otw-gold"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredStories.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No stories found</div>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}