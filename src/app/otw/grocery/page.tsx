'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  Info, 
  Timer, 
  Users, 
  Shield, 
  CreditCard,
  Camera,
  Upload,
  Package,
  ShoppingBag,
  Utensils,
  AlertCircle,
  Phone,
  MessageSquare,
  Navigation,
  DollarSign
} from 'lucide-react';

export default function TaskPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = [
    {
      id: 1,
      type: "grocery",
      customer: "Sarah Johnson",
      store: "Fresh Market",
      address: "123 Oak Street, Downtown",
      orderValue: "$87.50",
      estimatedTime: "45 min",
      priority: "high",
      status: "pending",
      screenshot: "/api/placeholder/300/200",
      items: ["Organic bananas", "Whole milk", "Bread", "Chicken breast", "Spinach"],
      notes: "Please check expiration dates carefully. Customer prefers organic when available.",
      distance: "0.8 miles",
      payment: "$12.50"
    },
    {
      id: 2,
      type: "food",
      customer: "Mike Chen",
      store: "Tony's Pizza",
      address: "456 Pine Avenue, Midtown",
      orderValue: "$34.99",
      estimatedTime: "25 min",
      priority: "medium",
      status: "in-progress",
      screenshot: "/api/placeholder/300/200",
      items: ["Large pepperoni pizza", "Garlic bread", "2L Coke"],
      notes: "Order is ready for pickup. Customer requested extra napkins.",
      distance: "1.2 miles",
      payment: "$8.75"
    },
    {
      id: 3,
      type: "grocery",
      customer: "Emily Davis",
      store: "SuperMart",
      address: "789 Elm Drive, Suburbs",
      orderValue: "$156.20",
      estimatedTime: "60 min",
      priority: "low",
      status: "pending",
      screenshot: "/api/placeholder/300/200",
      items: ["Weekly groceries", "Cleaning supplies", "Baby formula", "Fresh vegetables"],
      notes: "Large order. Customer will help unload. Baby formula is priority item.",
      distance: "2.5 miles",
      payment: "$18.50"
    },
    {
      id: 4,
      type: "food",
      customer: "David Wilson",
      store: "Burger Palace",
      address: "321 Main Street, City Center",
      orderValue: "$28.75",
      estimatedTime: "20 min",
      priority: "high",
      status: "completed",
      screenshot: "/api/placeholder/300/200",
      items: ["Double cheeseburger", "Large fries", "Milkshake"],
      notes: "Delivered successfully. Customer was very satisfied.",
      distance: "0.5 miles",
      payment: "$7.25"
    }
  ];

  const taskTypes = [
    { value: "all", label: "All Tasks", icon: ClipboardList, color: "bg-gray-500" },
    { value: "grocery", label: "Grocery Pickup", icon: ShoppingBag, color: "bg-green-500" },
    { value: "food", label: "Food Pickup", icon: Utensils, color: "bg-orange-500" }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = selectedFilter === 'all' || task.type === selectedFilter;
    const matchesSearch = task.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.store.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Task Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Manage your pickup tasks efficiently. View customer orders, screenshots, and complete deliveries with ease.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search tasks by customer or store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-lg"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center">
                <ClipboardList className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-gray-700 font-medium">{tasks.filter(t => t.status === 'pending').length} Pending Tasks</span>
              </div>
              <div className="flex items-center">
                <Timer className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-gray-700 font-medium">{tasks.filter(t => t.status === 'in-progress').length} In Progress</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-gray-700 font-medium">{tasks.filter(t => t.status === 'completed').length} Completed Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Management Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 sticky top-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Filter Tasks</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Task Type</Label>
                    <div className="mt-2 space-y-2">
                      {taskTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setSelectedFilter(type.value)}
                            className={`w-full flex items-center p-3 rounded-lg border transition-all duration-200 ${
                              selectedFilter === type.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center mr-3`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">Priority</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">Status</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Grid */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Tasks ({filteredTasks.length})</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="time">Estimated Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-12">
                {filteredTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 overflow-hidden"
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Task Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {task.customer}
                              </h3>
                              <p className="text-gray-600 flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {task.store}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={`${getPriorityColor(task.priority)} border`}>
                                {task.priority.toUpperCase()}
                              </Badge>
                              <Badge className={`${getStatusColor(task.status)} border`}>
                                {task.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                              <span className="font-medium">{task.orderValue}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-1 text-blue-500" />
                              <span>{task.estimatedTime}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Navigation className="w-4 h-4 mr-1 text-purple-500" />
                              <span>{task.distance}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CreditCard className="w-4 h-4 mr-1 text-orange-500" />
                              <span className="font-medium">Earn {task.payment}</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Address:</strong> {task.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Items:</strong> {task.items.join(', ')}
                            </p>
                          </div>
                          
                          {task.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <div className="flex items-start">
                                <Info className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800">{task.notes}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {task.status === 'pending' && (
                              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                Accept Task
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button className="bg-green-500 hover:bg-green-600 text-white">
                                Mark Complete
                              </Button>
                            )}
                            <Button variant="outline" className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Call Customer
                            </Button>
                            <Button variant="outline" className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>
                        
                        {/* Screenshot */}
                        <div className="lg:w-80">
                          <div className="bg-gray-100 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Camera className="w-4 h-4 mr-2" />
                              Order Screenshot
                            </h4>
                            <img 
                              src={task.screenshot} 
                              alt="Order screenshot"
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            />
                            <Button variant="outline" className="w-full mt-3 text-sm">
                              <Upload className="w-4 h-4 mr-2" />
                              View Full Size
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why drivers love OTW Tasks
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience efficient task management with clear instructions, fair compensation, and customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Timer className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Flexible scheduling</h3>
              <p className="text-gray-400">
                Choose your own hours and work when it's convenient for you.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Fair compensation</h3>
              <p className="text-gray-400">
                Earn competitive rates with transparent pricing and instant payouts.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Driver support</h3>
              <p className="text-gray-400">
                24/7 support team ready to help with any questions or issues.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Community driven</h3>
              <p className="text-gray-400">
                Join a community of drivers helping local customers every day.
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-8 py-4">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">+</div>
              </div>
              <span className="text-white font-medium">Join 500+ active drivers earning with OTW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl overflow-hidden shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our driver network and start earning money by helping customers with their pickup and delivery needs.
            </p>
            <Link href="/driver-signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Become a Driver
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
