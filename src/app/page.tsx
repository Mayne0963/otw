"use client";

// export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Button from "../components/Button";

const MapSearch = dynamic(() => import("../components/maps/MapSearch"), { ssr: false });

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  href,
  buttonText,
  buttonVariant,
}) => (
  <div className="otw-card group relative overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-otw-red/20">
    <div className="absolute inset-0 bg-gradient-to-br from-otw-red/5 via-transparent to-otw-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 p-8">
      <div className="w-16 h-16 bg-gradient-to-br from-otw-red to-otw-red/80 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <span className="text-3xl animate-pulse">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-otw-gold transition-colors duration-300">{title}</h3>
      <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300">{description}</p>
      <Link href={href}>
        <Button variant={buttonVariant} className="w-full group-hover:scale-105 transition-transform duration-300">
          {buttonText}
        </Button>
      </Link>
    </div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Enhanced Hero Section with Dynamic Elements */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-otw-red/20 via-black to-otw-gold/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-otw-gold/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-otw-red/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Live Status Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full mb-8 animate-pulse">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-ping" />
            <span className="text-green-400 font-semibold">🔴 LIVE: 47 drivers delivering now</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8">
            <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent animate-gradient-text">
              Fort Wayne's
            </span>
            <br />
            <span className="bg-gradient-to-r from-otw-red via-otw-gold to-otw-red bg-clip-text text-transparent">
              #1 Food Delivery
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience lightning-fast delivery from Fort Wayne's best restaurants. 
            <span className="text-otw-gold font-semibold">Average delivery time: 22 minutes</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button variant="primary" className="text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300">
              🚀 Order Now - Free Delivery
            </Button>
            <Button variant="secondary" className="text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300">
              📱 Download App
            </Button>
          </div>
          
          {/* Live Stats Counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-otw-gold animate-pulse">2,847</div>
              <div className="text-white/70 text-sm">Orders Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-otw-red animate-pulse">47</div>
              <div className="text-white/70 text-sm">Active Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 animate-pulse">156</div>
              <div className="text-white/70 text-sm">Partner Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-otw-gold animate-pulse">22 min</div>
              <div className="text-white/70 text-sm">Avg. Delivery Time</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section className="py-24 relative">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-otw-red/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-otw-gold/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent">
                Your Cravings,
              </span>
              <br />
              <span className="text-white">Our Mission</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              From late-night munchies to family feasts, we've got Fort Wayne covered with premium delivery services.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon="🍕"
              title="Food Delivery"
              description="Order from 150+ restaurants with lightning-fast delivery. Average time: 22 minutes."
              href="/menu"
              buttonText="Browse Restaurants"
              buttonVariant="primary"
            />
            <ServiceCard
              icon="🛒"
              title="Grocery Delivery"
              description="Fresh groceries delivered to your door. Same-day delivery from local stores."
              href="/grocery"
              buttonText="Shop Groceries"
              buttonVariant="secondary"
            />
            <ServiceCard
              icon="🎉"
              title="Event Catering"
              description="Large orders for parties, meetings, and events. Professional catering services."
              href="/catering"
              buttonText="Plan Event"
              buttonVariant="primary"
            />
          </div>
        </div>
      </section>

      {/* Restaurant Search Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect Meal
            </h2>
            <p className="text-xl text-white/80">
              Search from 150+ restaurants in Fort Wayne
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold"
              />
              <input
                type="text"
                placeholder="Enter your address"
                className="md:w-64 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold"
              />
              <Button variant="primary" className="px-8 py-4">
                Search
              </Button>
            </div>
            
            <MapSearch />
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Restaurants
            </h2>
            <p className="text-xl text-white/80">
              Top-rated spots loved by Fort Wayne
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['All', 'Pizza', 'Asian', 'Mexican', 'American', 'Healthy'].map((category) => (
              <button
                key={category}
                className="px-6 py-3 bg-white/10 hover:bg-otw-gold/20 border border-white/20 hover:border-otw-gold/50 rounded-full text-white hover:text-otw-gold transition-all duration-300"
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Tony's Pizza",
                cuisine: "Italian",
                rating: 4.8,
                deliveryTime: "25-35 min",
                image: "/restaurants/tonys.jpg"
              },
              {
                name: "Pho Saigon",
                cuisine: "Vietnamese",
                rating: 4.9,
                deliveryTime: "20-30 min",
                image: "/restaurants/pho.jpg"
              },
              {
                name: "Taco Libre",
                cuisine: "Mexican",
                rating: 4.7,
                deliveryTime: "15-25 min",
                image: "/restaurants/taco.jpg"
              },
              {
                name: "Burger Haven",
                cuisine: "American",
                rating: 4.6,
                deliveryTime: "20-30 min",
                image: "/restaurants/burger.jpg"
              },
              {
                name: "Green Bowl",
                cuisine: "Healthy",
                rating: 4.8,
                deliveryTime: "25-35 min",
                image: "/restaurants/green.jpg"
              },
              {
                name: "Sushi Zen",
                cuisine: "Japanese",
                rating: 4.9,
                deliveryTime: "30-40 min",
                image: "/restaurants/sushi.jpg"
              }
            ].map((restaurant, index) => (
              <div key={index} className="otw-card group cursor-pointer">
                <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute top-4 right-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {restaurant.deliveryTime}
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-otw-red/20 to-otw-gold/20 flex items-center justify-center">
                    <span className="text-6xl opacity-50">🍽️</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{restaurant.name}</h3>
                  <p className="text-white/70 mb-3">{restaurant.cuisine}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span className="text-white font-semibold">{restaurant.rating}</span>
                    </div>
                    <Button variant="primary" className="text-sm px-4 py-2">
                      Order Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Order Tracking */}
      <section className="py-24 bg-gradient-to-r from-otw-red/10 to-otw-gold/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Live Order Tracking
            </h2>
            <p className="text-xl text-white/80">
              Real-time updates on your delivery
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                orderId: "#OTW-2847",
                restaurant: "Tony's Pizza",
                status: "Out for Delivery",
                driver: "Mike Johnson",
                eta: "8 minutes",
                progress: 75
              },
              {
                orderId: "#OTW-2848",
                restaurant: "Pho Saigon",
                status: "Preparing",
                driver: "Sarah Chen",
                eta: "15 minutes",
                progress: 45
              }
            ].map((order, index) => (
              <div key={index} className="otw-card">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{order.orderId}</h3>
                      <p className="text-white/70">{order.restaurant}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Out for Delivery' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-white/70 mb-2">
                      <span>Progress</span>
                      <span>{order.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-otw-red to-otw-gold h-2 rounded-full transition-all duration-500"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">Driver: {order.driver}</p>
                      <p className="text-white/70 text-sm">ETA: {order.eta}</p>
                    </div>
                    <Button variant="secondary" className="text-sm px-4 py-2">
                      Track Live
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Fort Wayne Delivery Coverage
            </h2>
            <p className="text-xl text-white/80">
              We deliver everywhere in Fort Wayne and surrounding areas
            </p>
          </div>
          
          <div className="otw-card p-8">
            <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Interactive Map</h3>
                  <p className="text-white/70">Real-time delivery zones and driver locations</p>
                </div>
              </div>
              
              {/* Animated delivery zones */}
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-otw-gold/30 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
              
              {/* Delivery trucks */}
              <div className="absolute top-1/4 left-1/4 text-2xl animate-bounce">
                🚚
              </div>
              <div className="absolute bottom-1/3 right-1/3 text-2xl animate-bounce" style={{animationDelay: '1s'}}>
                🚚
              </div>
              <div className="absolute top-1/2 right-1/4 text-2xl animate-bounce" style={{animationDelay: '2s'}}>
                🚚
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-24 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Fort Wayne Says
            </h2>
            <p className="text-xl text-white/80">
              Real reviews from real customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "Downtown Fort Wayne",
                rating: 5,
                review: "OTW is a game-changer! Food arrives hot and fast every single time. The drivers are super friendly too.",
                avatar: "👩‍💼"
              },
              {
                name: "Mike Chen",
                location: "Aboite",
                rating: 5,
                review: "Best delivery service in Fort Wayne hands down. The app is smooth and tracking is spot-on. Highly recommend!",
                avatar: "👨‍💻"
              },
              {
                name: "Emily Rodriguez",
                location: "New Haven",
                rating: 5,
                review: "Love the variety of restaurants and the quick delivery times. OTW has become our go-to for family dinners.",
                avatar: "👩‍🍳"
              },
              {
                name: "David Thompson",
                location: "Southwest",
                rating: 5,
                review: "Customer service is top-notch. Had an issue once and they resolved it immediately with a full refund.",
                avatar: "👨‍🔧"
              },
              {
                name: "Lisa Park",
                location: "Northeast",
                rating: 5,
                review: "The live tracking feature is amazing. I always know exactly when my food will arrive. So convenient!",
                avatar: "👩‍⚕️"
              },
              {
                name: "James Wilson",
                location: "Waynedale",
                rating: 5,
                review: "Great selection of restaurants and the delivery fees are very reasonable. OTW is the best!",
                avatar: "👨‍🎓"
              }
            ].map((testimonial, index) => (
              <div key={index} className="otw-card">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                      <p className="text-white/70 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  
                  <p className="text-white/80 italic">"{testimonial.review}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="otw-card p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Get the OTW App
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Download our app for exclusive deals, faster ordering, and real-time tracking
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                  { icon: "🎯", title: "Exclusive Deals", description: "App-only discounts and promotions" },
                  { icon: "⚡", title: "Faster Ordering", description: "One-tap reordering and saved favorites" },
                  { icon: "📍", title: "Live Tracking", description: "Real-time GPS tracking of your order" }
                ].map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" className="text-lg px-8 py-4">
                  📱 Download for iOS
                </Button>
                <Button variant="secondary" className="text-lg px-8 py-4">
                  🤖 Download for Android
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Food Icons */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {['🍕', '🍔', '🍜', '🌮', '🍣'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-bounce"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '3s'
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Enhanced Services Section */}
      <section className="py-24 relative">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-otw-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-otw-red/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-otw-gold/30 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent">
                Premium Services
              </span>
              <br />
              <span className="text-white">for Fort Wayne</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Beyond food delivery - we're your complete lifestyle solution
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              icon="🥘"
              title="Catering Services"
              description="Professional catering for events, meetings, and special occasions with premium presentation."
              href="/catering"
              buttonText="Plan Event"
              buttonVariant="primary"
            />
            <ServiceCard
              icon="🛍️"
              title="Personal Shopping"
              description="Grocery shopping, pharmacy runs, and retail pickup services delivered to your door."
              href="/shopping"
              buttonText="Start Shopping"
              buttonVariant="secondary"
            />
            <ServiceCard
              icon="⭐"
              title="VIP Membership"
              description="Exclusive perks, priority delivery, and special discounts for our premium members."
              href="/tier"
              buttonText="Join VIP"
              buttonVariant="primary"
            />
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-24 bg-gradient-to-r from-otw-red/20 via-black to-otw-gold/20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-otw-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-otw-red/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-otw-gold/30 to-transparent" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-otw-gold via-white to-otw-gold bg-clip-text text-transparent">
                Stay in the Loop
              </span>
              <br />
              <span className="text-white">with OTW</span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
              Get exclusive deals, new restaurant announcements, and special offers delivered straight to your inbox. Join 25,000+ Fort Wayne food lovers!
            </p>
            
            <div className="max-w-md mx-auto">
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold backdrop-blur-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-otw-gold backdrop-blur-sm"
                />
                <Button variant="primary" className="px-8 py-4 whitespace-nowrap">
                  Join Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
