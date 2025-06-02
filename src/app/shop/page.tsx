"use client";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useState, useEffect } from "react"
import Image from "next/image"
import { FaCamera, FaMapMarkerAlt, FaClock, FaCheckCircle, FaUpload, FaUtensils, FaShoppingCart } from "react-icons/fa"
import { useAuth } from "../../contexts/AuthContext"

// Task interface
interface Task {
  id: string;
  type: 'food' | 'grocery';
  customerName: string;
  restaurantName?: string;
  storeName?: string;
  pickupAddress: string;
  deliveryAddress: string;
  orderTotal: number;
  status: 'pending' | 'accepted' | 'picking_up' | 'delivering' | 'completed';
  orderScreenshot?: string;
  estimatedTime: string;
  specialInstructions?: string;
  createdAt: Date;
}

export default function TaskPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskFilter, setTaskFilter] = useState<'all' | 'food' | 'grocery'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'picking_up' | 'delivering' | 'completed'>('all')
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        type: 'food',
        customerName: 'John Doe',
        restaurantName: 'Pizza Palace',
        pickupAddress: '123 Main St, Fort Wayne, IN',
        deliveryAddress: '456 Oak Ave, Fort Wayne, IN',
        orderTotal: 24.99,
        status: 'pending',
        estimatedTime: '30 mins',
        specialInstructions: 'Ring doorbell twice',
        createdAt: new Date()
      },
      {
        id: '2',
        type: 'grocery',
        customerName: 'Jane Smith',
        storeName: 'Fresh Market',
        pickupAddress: '789 Elm St, Fort Wayne, IN',
        deliveryAddress: '321 Pine Rd, Fort Wayne, IN',
        orderTotal: 67.45,
        status: 'accepted',
        estimatedTime: '45 mins',
        specialInstructions: 'Leave at front door',
        createdAt: new Date()
      },
      {
        id: '3',
        type: 'food',
        customerName: 'Mike Johnson',
        restaurantName: 'Burger Barn',
        pickupAddress: '555 Cedar Blvd, Fort Wayne, IN',
        deliveryAddress: '888 Maple Dr, Fort Wayne, IN',
        orderTotal: 18.75,
        status: 'picking_up',
        estimatedTime: '20 mins',
        createdAt: new Date()
      }
    ]
    setTasks(mockTasks)
  }, [])

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const typeMatch = taskFilter === 'all' || task.type === taskFilter
    const statusMatch = statusFilter === 'all' || task.status === statusFilter
    return typeMatch && statusMatch
  })

  // Task management functions
  const handleAcceptTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'accepted' as const } : task
    ))
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const handleUploadScreenshot = async (taskId: string, file: File) => {
    setUploadingScreenshot(true)
    // Simulate upload - in real app, this would upload to cloud storage
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, orderScreenshot: URL.createObjectURL(file) } : task
      ))
      setUploadingScreenshot(false)
    }, 2000)
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'picking_up': return 'bg-orange-100 text-orange-800'
      case 'delivering': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending': return <FaClock className="w-4 h-4" />
      case 'accepted': return <FaCheckCircle className="w-4 h-4" />
      case 'picking_up': return <FaMapMarkerAlt className="w-4 h-4" />
      case 'delivering': return <FaMapMarkerAlt className="w-4 h-4" />
      case 'completed': return <FaCheckCircle className="w-4 h-4" />
      default: return <FaClock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Task Dashboard</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Pick up food orders and grocery deliveries for customers in your area
          </p>
          <div className="flex items-center justify-center gap-4">
            <FaUtensils className="w-8 h-8" />
            <FaShoppingCart className="w-8 h-8" />
            <FaMapMarkerAlt className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Task Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FaClock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'pending').length}</h3>
              <p className="text-gray-600">Pending Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FaCheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'accepted').length}</h3>
              <p className="text-gray-600">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FaMapMarkerAlt className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'picking_up' || t.status === 'delivering').length}</h3>
              <p className="text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</h3>
              <p className="text-gray-600">Completed</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Task Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Available Tasks</h2>
            
            <div className="flex gap-4">
              {/* Task Type Filter */}
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value as 'all' | 'food' | 'grocery')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tasks</option>
                <option value="food">Food Delivery</option>
                <option value="grocery">Grocery Pickup</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'picking_up' | 'delivering' | 'completed')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="picking_up">Picking Up</option>
                <option value="delivering">Delivering</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Tasks Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {task.type === 'food' ? <FaUtensils className="w-5 h-5 text-orange-500" /> : <FaShoppingCart className="w-5 h-5 text-green-500" />}
                    <CardTitle className="text-lg">{task.type === 'food' ? task.restaurantName : task.storeName}</CardTitle>
                  </div>
                  <Badge className={`${getStatusColor(task.status)} flex items-center gap-1`}>
                    {getStatusIcon(task.status)}
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription>
                  Order for {task.customerName} • ${task.orderTotal.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Pickup:</p>
                      <p className="text-sm text-gray-600">{task.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Delivery:</p>
                      <p className="text-sm text-gray-600">{task.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">Est. {task.estimatedTime}</p>
                  </div>
                  {task.specialInstructions && (
                    <div className="bg-yellow-50 p-2 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> {task.specialInstructions}
                      </p>
                    </div>
                  )}
                  {task.orderScreenshot && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Order Screenshot:</p>
                      <Image
                        src={task.orderScreenshot}
                        alt="Order screenshot"
                        width={200}
                        height={150}
                        className="rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  {task.status === 'pending' && (
                    <Button onClick={() => handleAcceptTask(task.id)} className="flex-1">
                      Accept Task
                    </Button>
                  )}
                  {task.status === 'accepted' && (
                    <Button onClick={() => handleUpdateTaskStatus(task.id, 'picking_up')} className="flex-1">
                      Start Pickup
                    </Button>
                  )}
                  {task.status === 'picking_up' && (
                    <Button onClick={() => handleUpdateTaskStatus(task.id, 'delivering')} className="flex-1">
                      Start Delivery
                    </Button>
                  )}
                  {task.status === 'delivering' && (
                    <Button onClick={() => handleUpdateTaskStatus(task.id, 'completed')} className="flex-1">
                      Mark Complete
                    </Button>
                  )}
                  {!task.orderScreenshot && task.status !== 'completed' && (
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUploadScreenshot(task.id, file)
                        }}
                        className="hidden"
                        id={`screenshot-${task.id}`}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById(`screenshot-${task.id}`)?.click()}
                        disabled={uploadingScreenshot}
                        className="w-full flex items-center gap-2"
                      >
                        <FaUpload className="w-4 h-4" />
                        {uploadingScreenshot ? 'Uploading...' : 'Upload Screenshot'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your filter criteria or check back later for new tasks</p>
          </div>
        )}
      </section>

      {/* About Our Merch Section */}
      <section className="py-16 bg-[#111111]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Our Merch</h2>
              <p className="text-gray-300 mb-4">
                At OTW, we believe in quality that matches our food. Our merchandise is crafted with
                premium materials and designed to last, just like the memories you make in our restaurants.
              </p>
              <p className="text-gray-300 mb-4">
                Each piece is designed in-house and produced in limited quantities to ensure exclusivity. We partner
                with sustainable manufacturers who share our values of quality and responsibility.
              </p>
              <p className="text-gray-300">
                From comfortable tees to stylish accessories, our merch lets you take a piece of the OTW
                experience home with you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/truffle-fries.jpg"
                  alt="OTW Merchandise"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/vegan-burger.jpg"
                  alt="OTW Merchandise"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/buffalo-cauliflower.jpg"
                  alt="OTW Merchandise"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/wagyu-sandwich.jpg"
                  alt="OTW Merchandise"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
