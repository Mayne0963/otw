"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Button from "../components/Button";

const MapSearch = dynamic(() => import("../components/maps/MapSearch"), { ssr: false });

// Import SVG icons
import DeliveryTruckIcon from "../../public/assets/icons/delivery-truck.svg";
import ShoppingCartIcon from "../../public/assets/icons/shopping-cart.svg";
import CarIcon from "../../public/assets/icons/car.svg";

interface ServiceCardProps {
  icon: any; // Changed to accept SVG component
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
  <div className="bg-[#1A1A1A] p-10 rounded-lg border border-[#C1272D] transform hover:scale-103 transition-transform duration-300">
    <div className="w-16 h-16 bg-[#1A1A1A] border border-[#C1272D] rounded-lg flex items-center justify-center mb-6">
      <Image src={icon} alt={title} width={32} height={32} />
    </div>
    <h3 className="text-2xl font-bold text-[#E5E5E5] mb-4">{title}</h3>
    <p className="text-[#CCCCCC] mb-8">{description}</p>
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
      <section className="relative bg-[#111111] py-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C1272D]/30 via-[#111111]/90 to-[#B8860B]/20 opacity-80 pointer-events-none" />
        <h1 className="relative z-10 text-5xl md:text-6xl font-black text-[#B8860B] mb-6 animate-fade-in">
          On The Way Delivery
        </h1>
        <p className="relative z-10 text-xl md:text-2xl text-[#E5E5E5] mb-10 max-w-2xl">
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
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120vw] h-32 bg-gradient-to-t from-[#111111] to-transparent opacity-90 pointer-events-none" />
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#B8860B] text-center mb-16">
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

      <section className="py-24 px-6 bg-[#111111]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#B8860B] text-center mb-8">
            Explore Your Area
          </h2>
          <p className="text-lg text-center text-[#CCCCCC] mb-10 max-w-2xl mx-auto">
            Find local spots and services near you. Search locations and get directions instantly.
          </p>
          <div className="rounded-lg overflow-hidden shadow-md border border-[#B8860B]/20 bg-[#0A0A0A]">
            <MapSearch height="450px" showSearchBar={true} />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#B8860B] text-center mb-6">
            Fort Wayne's Best Restaurants
          </h2>
          <p className="text-xl text-center text-[#E5E5E5] mb-12">
            Order from your favorite local spots, delivered by OTW
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333333] hover:border-[#B8860B] transition-all duration-300">
              <div className="h-40 relative">
                <Image
                  src="/assets/images/placeholder.svg?key=3aeoi"
                  alt="Broski's Kitchen"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#E5E5E5]">
                  Broski's Kitchen
                </h3>
                <p className="text-sm text-[#CCCCCC]">Luxury street gourmet</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-[#B8860B]">25-40 min</span>
                  <Link
                    href="/restaurants/broskis-kitchen"
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
