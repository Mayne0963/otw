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
    href: "/membership",
    icon: <Crown className="mr-3 h-4 w-4" />,
  },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useFirebaseAuth();
  const { cartItems } = useCart();
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
      await signOut();
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-otw-black/95 backdrop-blur-md border-b border-otw-gold/20">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
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
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-otw-black/95 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-otw-gold/10">
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
                      "-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 transition-colors",
                      pathname === item.href
                        ? "text-otw-gold bg-otw-gold/5"
                        : "text-white/70 hover:text-otw-gold hover:bg-otw-gold/5",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
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
                      className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/cart"
                      className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="mr-3 h-4 w-4" />
                      Cart ({cartItemCount})
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white/70 hover:text-otw-gold hover:bg-otw-gold/5"
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

export default Navbar;
