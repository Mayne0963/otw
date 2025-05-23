"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "./Button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-black/80"
      } border-b border-primary-red/50`}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center group">
              <div className="relative h-10 w-20 sm:h-12 sm:w-24 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/assets/logos/otw-logo-new-red-transparent.jpg"
                  alt="OTW Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  className="transition-opacity duration-300 hover:opacity-90"
                  priority
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
              <span className="sr-only">OTW — Thee Motion of the People</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/broskis"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                Broski's Kitchen
              </Link>
              <Link
                href="/otw"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                OTW Services
              </Link>
              <Link
                href="/track"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                Track Order
              </Link>
              <Link
                href="/dashboard"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                MyOTW
              </Link>
              <Link
                href="/partners"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                Partners
              </Link>
              <Link
                href="/volunteers"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                Volunteers
              </Link>
              <Link
                href="/hall-of-hustle"
                className="text-white hover:text-accent-gold transition-colors duration-300 font-medium min-h-[44px] flex items-center"
              >
                Hall of Hustle
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button href="/signup" variant="secondary" className="py-2 px-4">
              Sign Up
            </Button>
            <Button href="/signin" variant="primary" className="py-2 px-4">
              Sign In
            </Button>
            <Button href="/tier" variant="secondary" className="py-2 px-4">
              Join Tier
            </Button>
          </div>

          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red min-h-[44px] min-w-[44px]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu - improved animation and touch targets */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col space-y-4 py-4">
            <Link
              href="/broskis"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Broski's Kitchen
            </Link>
            <Link
              href="/otw"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              OTW Services
            </Link>
            <Link
              href="/track"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              MyOTW
            </Link>
            <Link
              href="/partners"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Partners
            </Link>
            <Link
              href="/volunteers"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Volunteers
            </Link>
            <Link
              href="/hall-of-hustle"
              className="text-white hover:text-accent-gold transition-colors px-2 py-2 rounded hover:bg-gray-800/50 min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Hall of Hustle
            </Link>
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-800">
              <Button
                href="/signup"
                variant="secondary"
                fullWidth
                className="text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Button>
              <Button
                href="/signin"
                variant="primary"
                fullWidth
                className="text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Button>
              <Button
                href="/tier"
                variant="secondary"
                fullWidth
                className="text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Join Tier
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
