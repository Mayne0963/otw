"use client";

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
  <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#C1272D] transform hover:scale-105 transition-transform duration-300">
    <div className="w-16 h-16 bg-[#C1272D] rounded-full flex items-center justify-center mb-6">
      <span className="text-3xl">{icon}</span>
    </div>
    <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-400 mb-6">{description}</p>
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
      <section className="relative bg-otw-black py-24 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-otw-red/60 via-otw-black/80 to-otw-gold/40 opacity-80 pointer-events-none" />
        <h1 className="relative z-10 text-5xl md:text-6xl font-extrabold text-otw-gold drop-shadow-lg mb-6 animate-fade-in">
          On The Way Delivery
        </h1>
        <p className="relative z-10 text-xl md:text-2xl text-white/90 mb-8 max-w-2xl animate-fade-in">
          Fort Wayne's all-in-one platform for food, groceries, and rides.
          Local, fast, and community-driven.
        </p>
        <Link href="/restaurants" className="relative z-10">
          <Button
            variant="primary"
            size="lg"
            className="px-8 py-4 text-lg shadow-otw-lg animate-pulse-gold"
          >
            Order Now
          </Button>
        </Link>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120vw] h-32 bg-gradient-to-t from-otw-black to-transparent opacity-80 pointer-events-none" />
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#FFD700] text-center mb-16">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard
            icon="🚚"
            title="Food Delivery"
            description="Get your favorite meals delivered right to your door with our premium delivery service."
            href="/restaurants"
            buttonText="Order Now"
            buttonVariant="primary"
          />
          <ServiceCard
            icon="🛒"
            title="Grocery Shop & Drop"
            description="Let us handle your grocery shopping and delivery with care and precision."
            href="/otw"
            buttonText="Book Service"
            buttonVariant="secondary"
          />
          <ServiceCard
            icon="🚗"
            title="Local Rides"
            description="Quick and reliable transportation around town with our trusted drivers."
            href="/otw"
            buttonText="Book Ride"
            buttonVariant="primary"
          />
        </div>
      </section>

      <section className="py-20 px-4 bg-[#181818]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFD700] text-center mb-8">
            Explore Your Area
          </h2>
          <p className="text-lg text-center text-white/80 mb-8 max-w-2xl mx-auto">
            Find restaurants, stores, and services near you. Use the interactive map below to search for locations and get directions instantly.
          </p>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-otw-gold/20 bg-black/80">
            <MapSearch height="450px" showSearchBar={true} />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#FFD700] text-center mb-6">
            Fort Wayne's Best Restaurants
          </h2>
          <p className="text-xl text-center text-white mb-12">
            Order from your favorite local spots, delivered by OTW
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#FFD700] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=3aeoi"
                  alt="Broski's Kitchen"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">
                  Broski's Kitchen
                </h3>
                <p className="text-sm text-gray-400">Luxury street gourmet</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-[#FFD700]">25-40 min</span>
                  <Link
                    href="/restaurants/broskis-kitchen"
                    className="text-sm text-[#C1272D] hover:underline"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#FFD700] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=3zcfz"
                  alt="Fort Wayne Pizza Co."
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">
                  Fort Wayne Pizza Co.
                </h3>
                <p className="text-sm text-gray-400">Hand-tossed pizzas</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-[#FFD700]">30-45 min</span>
                  <Link
                    href="/restaurants/fort-wayne-pizza"
                    className="text-sm text-[#C1272D] hover:underline"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#FFD700] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=26tm0"
                  alt="Taqueria Jalisco"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">
                  Taqueria Jalisco
                </h3>
                <p className="text-sm text-gray-400">Authentic Mexican</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-[#FFD700]">20-35 min</span>
                  <Link
                    href="/restaurants/taqueria-jalisco"
                    className="text-sm text-[#C1272D] hover:underline"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#FFD700] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=3p6ah"
                  alt="Seoul Garden"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">Seoul Garden</h3>
                <p className="text-sm text-gray-400">Korean BBQ</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-[#FFD700]">35-50 min</span>
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

          <div className="text-center mt-10">
            <Link href="/restaurants">
              <Button variant="primary">View All Restaurants</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#1A1A1A] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#FFD700] mb-6">
            Join Our Tier Membership
          </h2>
          <p className="text-xl mb-8 text-white">
            Skip service fees and unlock exclusive perks
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black p-6 rounded-xl border border-[#C1272D]">
              <h3 className="text-2xl font-bold text-[#FFD700] mb-4">Bronze</h3>
              <p className="text-3xl font-bold text-white mb-4">
                $10<span className="text-lg">/mo</span>
              </p>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li>No service fees</li>
                <li>2 free ride tokens</li>
                <li>Basic support</li>
              </ul>
              <Button variant="primary" className="w-full">
                Join Now
              </Button>
            </div>
            <div className="bg-black p-6 rounded-xl border-2 border-[#FFD700] transform scale-105">
              <h3 className="text-2xl font-bold text-[#FFD700] mb-4">Silver</h3>
              <p className="text-3xl font-bold text-white mb-4">
                $25<span className="text-lg">/mo</span>
              </p>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li>All Bronze perks</li>
                <li>Early access</li>
                <li>Premium reps</li>
              </ul>
              <Button variant="secondary" className="w-full">
                Join Now
              </Button>
            </div>
            <div className="bg-black p-6 rounded-xl border border-[#C1272D]">
              <h3 className="text-2xl font-bold text-[#FFD700] mb-4">Gold</h3>
              <p className="text-3xl font-bold text-white mb-4">
                $50<span className="text-lg">/mo</span>
              </p>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li>All Silver perks</li>
                <li>Raffle multipliers</li>
                <li>Concierge matching</li>
              </ul>
              <Button variant="primary" className="w-full">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
