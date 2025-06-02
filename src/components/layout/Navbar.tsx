"use client";
import React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  MapPin,
  Crown,
  HelpingHand,
  Camera,
} from "lucide-react";
import { useCart } from "../../lib/context/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../Button";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { cn } from "../../lib/utils";
import Image from "next/image";

const mainNavItems = [
  { name: "Home", href: "/", icon: <Home className="mr-3 h-4 w-4" /> },
  {
    name: "Services",
    href: "/otw",
    icon: <Car className="mr-3 h-4 w-4" />,
  },
  {
      name: "Broski's Kitchen",
      href: "/restaurants",
    icon: <Utensils className="mr-3 h-4 w-4" />,
  },

  {
    name: "Loyalty",
    href: "/loyalty",
    icon: <Crown className="mr-3 h-4 w-4" />,
  },
  {
    name: "Events",
    href: "/events",
    icon: <Camera className="mr-3 h-4 w-4" />,
  },
  {
    name: "Help",
    href: "/help",
    icon: <HelpingHand className="mr-3 h-4 w-4" />,
  },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-otw-black/90 backdrop-blur-xl border-b border-otw-gold/30 shadow-lg shadow-otw-black/50">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">On The Way Delivery</span>
            <Image
              className="h-8 w-auto"
              src="/assets/logos/otw-logo-new-red-transparent.png"
              alt="On The Way Delivery"
              width={120}
              height={32}
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white/70 hover:text-otw-gold"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {mainNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-sm font-semibold leading-6 transition-all duration-300 rounded-md group",
                pathname === item.href
                  ? "text-otw-gold bg-otw-gold/10"
                  : "text-white/80 hover:text-otw-gold hover:bg-otw-gold/5",
              )}
            >
              <span className="relative z-10">{item.name}</span>
              <div className={cn(
                "absolute inset-0 rounded-md border transition-all duration-300",
                pathname === item.href
                  ? "border-otw-gold/30"
                  : "border-transparent group-hover:border-otw-gold/20"
              )} />
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link
            href="/cart"
            className="relative -m-2.5 p-2.5 text-white/70 hover:text-otw-gold transition-colors"
          >
            <span className="sr-only">Shopping cart</span>
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-otw-gold text-xs font-medium text-black flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-x-4">
              <Link
                href="/profile"
                className="-m-2.5 p-2.5 text-white/70 hover:text-otw-gold transition-colors"
              >
                <span className="sr-only">Profile</span>
                <User className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-otw-gold/20 text-white/70 hover:text-otw-gold hover:border-otw-gold"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-x-4">
              <Link
                href="/signin"
                className="text-sm font-semibold leading-6 text-white/70 hover:text-otw-gold transition-colors"
              >
                Sign in
              </Link>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-otw-gold/20 text-white/70 hover:text-otw-gold hover:border-otw-gold"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden",
          mobileMenuOpen ? "fixed inset-0 z-50" : "hidden",
        )}
      >
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-otw-black/95 backdrop-blur-xl px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-otw-gold/20 sm:shadow-2xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">On The Way Delivery</span>
              <Image
                className="h-8 w-auto"
                src="/images/otw-logo.png"
                alt="On The Way Delivery"
                width={120}
                height={32}
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white/70 hover:text-otw-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-otw-gold/10">
              <div className="space-y-2 py-6">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "-mx-3 flex items-center rounded-xl px-4 py-3 text-base font-semibold leading-7 transition-all duration-300 border",
                      pathname === item.href
                        ? "text-otw-gold bg-otw-gold/10 border-otw-gold/30 shadow-lg shadow-otw-gold/10"
                        : "text-white/80 hover:text-otw-gold hover:bg-otw-gold/5 border-transparent hover:border-otw-gold/20 hover:shadow-md",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="ml-1">{item.name}</span>
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="-mx-3 flex items-center rounded-xl px-4 py-3 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold hover:bg-otw-gold/5 border border-transparent hover:border-otw-gold/20 hover:shadow-md transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex-shrink-0"><User className="mr-3 h-4 w-4" /></span>
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/cart"
                      className="-mx-3 flex items-center rounded-xl px-4 py-3 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold hover:bg-otw-gold/5 border border-transparent hover:border-otw-gold/20 hover:shadow-md transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex-shrink-0"><ShoppingBag className="mr-3 h-4 w-4" /></span>
                      <span>Cart ({cartItemCount})</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="-mx-3 flex w-full text-left rounded-xl px-4 py-3 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold hover:bg-otw-gold/5 border border-transparent hover:border-otw-gold/20 hover:shadow-md transition-all duration-300"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="-mx-3 block rounded-xl px-4 py-3 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold hover:bg-otw-gold/5 border border-transparent hover:border-otw-gold/20 hover:shadow-md transition-all duration-300"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="-mx-3 block rounded-xl px-4 py-3 text-base font-semibold leading-7 text-otw-gold bg-otw-gold/10 border border-otw-gold/30 hover:bg-otw-gold/20 hover:shadow-lg transition-all duration-300"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
