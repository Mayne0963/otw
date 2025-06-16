"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Button from "../components/Button";

const MapSearch = dynamic(() => import("../components/maps/MapSearch"), { ssr: false });

// Import icon components from lucide-react
import { Truck as DeliveryTruckIcon, ShoppingCart as ShoppingCartIcon, Car as CarIcon } from "lucide-react";

interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  href,
  buttonText,
  buttonVariant,
}) => (
  <div className="luxe-card group transform hover:scale-102 transition-transform duration-400">
    <div className="w-16 h-16 bg-gradient-to-br from-luxe-gold-dark to-luxe-gold-light rounded-lg flex items-center justify-center mb-6 shadow-lg">
      <Icon className="text-luxe-black-primary" />
    </div>
    <h3 className="text-2xl font-bold text-luxe-text-off-white mb-4" style={{fontFamily: 'Playfair Display, serif'}}>{title}</h3>
    <p className="text-luxe-text-soft-gray mb-8">{description}</p>
    <Link href={href}>
      <Button variant={buttonVariant} className="w-full">
        {buttonText}
      </Button>
    </Link>
  </div>
);

export default function Home() {
  return (
    <main>
      <section className="relative bg-luxe-black-primary py-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden luxe-section">
        <div className="absolute inset-0 bg-gradient-to-br from-luxe-burgundy-primary/20 via-luxe-black-charcoal/90 to-luxe-gold-dark/15 opacity-80 pointer-events-none" />
        <h1 className="relative z-10 text-5xl md:text-7xl font-bold text-luxe-text-off-white mb-6 leading-tight luxe-gradient-text" style={{fontFamily: 'Playfair Display, serif'}}>
          On The Way Delivery
        </h1>
        <p className="relative z-10 text-xl md:text-2xl text-luxe-text-warm-gray mb-10 max-w-2xl" style={{fontFamily: 'Montserrat, sans-serif'}}>
          Fast. Local. Real.
          <br />
          Soulful delivery, built for the city.
        </p>
        <Link href="/restaurants" className="relative z-10">
          <Button
            variant="primary"
            size="lg"
            className="px-8 py-4 text-lg shadow-md animate-pulse-gold"
          >
            Order Now
          </Button>
        </Link>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120vw] h-32 bg-gradient-to-t from-luxe-black-primary to-transparent opacity-90 pointer-events-none" />
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-luxe-gold-dark text-center mb-16 luxe-gradient-text" style={{fontFamily: 'Playfair Display, serif'}}>
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ServiceCard
            icon={DeliveryTruckIcon}
            title="Food Delivery"
            description="Get your favorite meals delivered right to your door with speed and reliability."
            href="/restaurants"
            buttonText="Order Now"
            buttonVariant="primary"
          />
          <ServiceCard
            icon={ShoppingCartIcon}
            title="Grocery Shop & Drop"
            description="Let us handle your grocery shopping and delivery with care and precision."
            href="/otw"
            buttonText="Book Service"
            buttonVariant="secondary"
          />
          <ServiceCard
            icon={CarIcon}
            title="Local Rides"
            description="Quick and reliable transportation around town with our trusted drivers."
            href="/otw"
            buttonText="Book Ride"
            buttonVariant="primary"
          />
        </div>
      </section>

      <section className="py-24 px-6 bg-luxe-black-charcoal luxe-section">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 tracking-wide luxe-gradient-text" style={{fontFamily: 'Playfair Display, serif'}}>
            Explore Your Area
          </h2>
          <p className="text-lg text-center text-luxe-text-soft-gray mb-10 max-w-2xl mx-auto leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
            Find local spots and services near you. Search locations and get directions instantly.
          </p>
          <div className="rounded-lg overflow-hidden shadow-2xl border border-luxe-gold-dark/30 bg-luxe-burgundy-dark/10 backdrop-blur-sm">
            <MapSearch height="450px" showSearchBar={true} />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-luxe-black-charcoal luxe-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 tracking-wide luxe-gradient-text" style={{fontFamily: 'Playfair Display, serif'}}>
            Fort Wayne's Best Restaurants
          </h2>
          <p className="text-xl text-center text-luxe-text-off-white mb-12 leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
            Order from your favorite local spots, delivered by OTW
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="luxe-card group">
              <div className="h-40 relative overflow-hidden rounded-t-lg">
                <Image
                  src="/assets/images/placeholder.svg?key=3aeoi"
                  alt="Broski's Kitchen"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-400 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-luxe-text-off-white tracking-wide" style={{fontFamily: 'Playfair Display, serif'}}>
                  Broski's Kitchen
                </h3>
                <p className="text-sm text-luxe-text-soft-gray">Luxury street gourmet</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-luxe-gold-light font-medium">25-40 min</span>
                  <Link
                    href="/restaurants/broskis-kitchen"
                    className="luxe-button-primary text-sm px-4 py-2"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#B8860B] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=3zcfz"
                  alt="Fort Wayne Pizza Co."
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#E5E5E5]">
                  Fort Wayne Pizza Co.
                </h3>
                <p className="text-sm text-[#CCCCCC]">Hand-tossed pizzas</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-[#B8860B]">30-45 min</span>
                  <Link
                    href="/restaurants/fort-wayne-pizza"
                    className="text-sm text-[#C1272D] hover:underline"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#B8860B] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=26tm0"
                  alt="Taqueria Jalisco"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#E5E5E5]">
                  Taqueria Jalisco
                </h3>
                <p className="text-sm text-[#CCCCCC]">Authentic Mexican</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-[#B8860B]">20-35 min</span>
                  <Link
                    href="/restaurants/taqueria-jalisco"
                    className="text-sm text-[#C1272D] hover:underline"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#B8860B] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=3p6ah"
                  alt="Seoul Garden"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#E5E5E5]">Seoul Garden</h3>
                <p className="text-sm text-[#CCCCCC]">Korean BBQ</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-[#B8860B]">35-50 min</span>
                  <Link
                    href="/restaurants/seoul-garden"
                    className="text-sm text-[#C1272D] hover:underline"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/restaurants">
              <Button variant="primary" className="px-8">View All Restaurants</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#B8860B] text-center mb-6">
            OTW Membership Tiers
          </h2>
          <p className="text-xl text-center text-[#E5E5E5] mb-12">
            Fast. Local. Real.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111111] rounded-lg p-8 border border-[#333333] hover:border-[#B8860B] transition-all duration-300">
              <h3 className="text-2xl font-bold text-[#B8860B] mb-4 text-center">
                Bronze
              </h3>
              <div className="text-3xl font-bold text-[#E5E5E5] text-center mb-6">
                $9.99<span className="text-lg font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Free delivery on orders $15+
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Priority customer service
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Exclusive monthly offers
                </li>
              </ul>
              <Button
                variant="primary"
                className="w-full shadow-sm"
                onClick={() => console.log("Bronze selected")}
              >
                Select Plan
              </Button>
            </div>

            <div className="bg-[#111111] rounded-lg p-8 border border-[#B8860B]">
              <div className="bg-[#B8860B] text-black font-bold py-1 px-4 rounded-md text-sm inline-block mb-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-[#B8860B] mb-4 text-center">
                Silver
              </h3>
              <div className="text-3xl font-bold text-[#E5E5E5] text-center mb-6">
                $14.99<span className="text-lg font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> All Bronze benefits
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Free delivery on all orders
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> 5% discount on all orders
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Early access to new restaurants
                </li>
              </ul>
              <Button
                variant="primary"
                className="w-full shadow-sm"
                onClick={() => console.log("Silver selected")}
              >
                Select Plan
              </Button>
            </div>

            <div className="bg-[#111111] rounded-lg p-8 border border-[#333333] hover:border-[#B8860B] transition-all duration-300">
              <h3 className="text-2xl font-bold text-[#B8860B] mb-4 text-center">
                Gold
              </h3>
              <div className="text-3xl font-bold text-[#E5E5E5] text-center mb-6">
                $24.99<span className="text-lg font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> All Silver benefits
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> 10% discount on all orders
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Priority delivery scheduling
                </li>
                <li className="flex items-center text-[#CCCCCC]">
                  <span className="mr-2 text-[#C1272D]">✓</span> Exclusive events and tastings
                </li>
              </ul>
              <Button
                variant="primary"
                className="w-full shadow-sm"
                onClick={() => console.log("Gold selected")}
              >
                Select Plan
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
