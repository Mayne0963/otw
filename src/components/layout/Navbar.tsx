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
} from "lucide-react";
import { useCart } from "../../lib/context/CartContext";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import Button from "../Button";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { cn } from "../../lib/utils";
import Image from "next/image";

const mainNavItems = [
  { name: "Home", href: "/", icon: <Home className="mr-3 h-4 w-4" /> },
  {
    name: "Book Service",
    href: "/otw",
    icon: <Car className="mr-3 h-4 w-4" />,
  },
  { name: "Track", href: "/track", icon: <MapPin className="mr-3 h-4 w-4" /> },
  {
    name: "Partners",
    href: "/partners",
    icon: <HelpingHand className="mr-3 h-4 w-4" />,
  },
  {
    name: "Volunteers",
    href: "/volunteers",
    icon: <HelpingHand className="mr-3 h-4 w-4" />,
  },
  {
    name: "Restaurants",
    href: "/restaurants",
    icon: <Utensils className="mr-3 h-4 w-4" />,
  },
  {
    name: "Membership",
    href: "/tier",
    icon: <Crown className="mr-3 h-4 w-4" />,
  },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, setUserMenuOpen] = useState(false);
  useCart(); // Keep the context connected without destructuring
  const pathname = usePathname();
  const { user, logout } = useFirebaseAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname, setMobileMenuOpen, setUserMenuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  // Close menus when clicking outside
  useOnClickOutside<HTMLDivElement>(menuRef, () => setMobileMenuOpen(false));
  useOnClickOutside<HTMLDivElement>(userMenuRef, () => setUserMenuOpen(false));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        scrolled
          ? "bg-otw-black/80 backdrop-blur-md border-b border-otw-gold/10"
          : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">On The Way Delivery</span>
            <Image
              className="h-12 w-auto"
              src="/assets/logos/logo.png"
              alt="OTW Delivery"
              width={48}
              height={48}
              priority
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
        <div className="hidden lg:flex lg:gap-x-12">
          {mainNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 transition-colors",
                pathname === item.href
                  ? "text-otw-gold"
                  : "text-white/70 hover:text-otw-gold",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-otw-gold"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>
          {user ? (
            <>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-otw-gold"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => logout()}
                className="text-white border-white/20 hover:bg-otw-gold hover:text-otw-black"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-otw-gold"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-otw-gold text-otw-black hover:bg-otw-gold-600">
                  Sign up
                </Button>
              </Link>
            </>
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
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-otw-black/95 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-otw-gold/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">On The Way Delivery</span>
              <Image
                className="h-8 w-auto"
                src="/assets/logos/logo.png"
                alt="OTW Delivery"
                width={32}
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
                      "flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors",
                      pathname === item.href
                        ? "text-otw-gold bg-otw-gold/10"
                        : "text-white/70 hover:text-otw-gold hover:bg-otw-gold/5",
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
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
