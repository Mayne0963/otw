"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import {
  Car,
  ShoppingBag,
  Package,
  Truck,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
} from "lucide-react";

export default function OTWServicesPage() {
  return (
    <div className="min-h-screen pb-20 pt-24">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/otw-services-hero.jpg')" }}
          ></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">OTW Services</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Fast, reliable delivery and transportation services for Fort Wayne
            and surrounding areas.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Ride Service */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-otw-gold transition-all duration-300">
              <div className="p-6">
                <div className="w-14 h-14 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                  <Car className="w-7 h-7 text-otw-red" />
                </div>
                <h3 className="text-xl font-bold mb-3">Local Rides</h3>
                <p className="text-gray-400 mb-6">
                  Need a ride? Our drivers will get you where you need to go
                  safely and on time.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Available 24/7</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Fort Wayne and surrounding areas
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Affordable flat rates</span>
                  </div>
                </div>
                <Link href="/otw/rides">
                  <Button className="w-full">Book a Ride</Button>
                </Link>
              </div>
            </div>

            {/* Grocery Delivery */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-otw-gold transition-all duration-300">
              <div className="p-6">
                <div className="w-14 h-14 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-7 h-7 text-otw-red" />
                </div>
                <h3 className="text-xl font-bold mb-3">Grocery Shop & Drop</h3>
                <p className="text-gray-400 mb-6">
                  We'll shop for your groceries and deliver them right to your
                  door.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Same-day delivery available
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Package className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Careful handling of all items
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      No markup on grocery prices
                    </span>
                  </div>
                </div>
                <Link href="/otw/grocery">
                  <Button className="w-full">Order Grocery Delivery</Button>
                </Link>
              </div>
            </div>

            {/* Package Delivery */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-otw-gold transition-all duration-300">
              <div className="p-6">
                <div className="w-14 h-14 bg-otw-red/10 rounded-full flex items-center justify-center mb-6">
                  <Package className="w-7 h-7 text-otw-red" />
                </div>
                <h3 className="text-xl font-bold mb-3">Package Delivery</h3>
                <p className="text-gray-400 mb-6">
                  Need something delivered across town? We've got you covered.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      Fast, same-day delivery
                    </span>
                  </div>
                  <div className="flex items-start">
                    <Truck className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Packages of all sizes</span>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="w-5 h-5 text-otw-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Competitive rates</span>
                  </div>
                </div>
                <Link href="/otw/package">
                  <Button className="w-full">Schedule a Delivery</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Book Your Service</h3>
              <p className="text-gray-400">
                Choose the service you need and schedule it through our website
                or app.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Track in Real-Time</h3>
              <p className="text-gray-400">
                Follow your driver or delivery in real-time through our tracking
                system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-otw-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-otw-gold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Receive Your Service</h3>
              <p className="text-gray-400">
                Get your delivery or ride with our professional and friendly
                staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6">Book a Service Now</h2>
                <p className="text-gray-400 mb-6">
                  Need something delivered or a ride? Book now and we'll be on
                  the way!
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-otw-gold mr-3" />
                    <span>Call us: (260) 555-OTWD</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-otw-gold mr-3" />
                    <span>Available 24/7</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/otw/rides">
                    <Button>Book a Ride</Button>
                  </Link>
                  <Link href="/otw/grocery">
                    <Button variant="outline">Grocery Delivery</Button>
                  </Link>
                  <Link href="/otw/package">
                    <Button variant="outline">Package Delivery</Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-64 lg:h-auto">
                <Image
                  src="/assets/images/otw-booking.png"
                  alt="OTW Booking"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "OTW has been a lifesaver! Their grocery delivery service is
                prompt and the drivers are always friendly."
              </p>
              <p className="font-bold">- Sarah J.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "I use OTW for rides to work when my car is in the shop. Always
                on time and professional drivers."
              </p>
              <p className="font-bold">- Michael T.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center text-otw-gold mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Their package delivery service is the best in Fort Wayne. Fast,
                reliable, and they handle everything with care."
              </p>
              <p className="font-bold">- Jessica R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-otw-red/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who rely on OTW for their
            delivery and transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/otw/rides">
              <Button size="lg">Book a Service</Button>
            </Link>
            <Link href="/tier">
              <Button variant="outline" size="lg">
                Join Tier Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
