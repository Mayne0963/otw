"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-luxe-black-charcoal/95 backdrop-blur-md border-b border-luxe-gold-dark/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-luxe-gold-light font-bold text-2xl tracking-widest uppercase" style={{fontFamily: 'Playfair Display, serif'}}>
              OTW
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link
                href="/restaurants"
                className="nav-link"
              >
                Restaurants
              </Link>
              <Link
                href="/otw"
                className="nav-link"
              >
                OTW Service
              </Link>
              <Link
                href="/dashboard"
                className="nav-link"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-luxe-text-off-white hover:text-luxe-gold-light focus:outline-none transition-colors duration-300"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${
          isOpen ? "block" : "hidden"
        } fixed right-0 top-16 w-72 h-screen bg-luxe-black-charcoal/98 backdrop-blur-lg border-l border-luxe-gold-dark/30`}
      >
        <div className="px-4 pt-6 pb-3 space-y-2">
          <Link
            href="/restaurants"
            className="nav-link block w-full text-left"
            onClick={() => setIsOpen(false)}
          >
            Restaurants
          </Link>
          <Link
            href="/otw"
            className="nav-link block w-full text-left"
            onClick={() => setIsOpen(false)}
          >
            OTW Service
          </Link>
          <Link
            href="/dashboard"
            className="nav-link block w-full text-left"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
