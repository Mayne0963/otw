'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServicesOpen(false);
        setMobileServicesOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              OTW
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/restaurants"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Broski&apos;s Kitchen
              </Link>
              
              {/* Services Dropdown */}
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                >
                  <span>Services</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    servicesOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-1 w-56 bg-black/95 backdrop-blur-sm border border-white/10 rounded-md shadow-lg transition-all duration-200 ${
                  servicesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}>
                  <div className="py-1">
                    <Link
                      href="/otw/rides"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      Ride Services
                    </Link>
                    <Link
                      href="/otw/grocery-delivery"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      Grocery Delivery
                    </Link>
                    <Link
                      href="/otw/package"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      Package Delivery
                    </Link>
                    <Link
                      href="/otw"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10 mt-1"
                      onClick={() => setServicesOpen(false)}
                    >
                      All Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
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
          isOpen ? 'block' : 'hidden'
        } fixed right-0 top-16 w-64 h-screen bg-black/95 backdrop-blur-sm border-l border-white/10`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/restaurants"
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Broski&apos;s Kitchen
          </Link>
          
          {/* Mobile Services Dropdown */}
          <div>
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="text-gray-300 hover:text-white w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center justify-between"
            >
              <span>Services</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                mobileServicesOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Mobile Services Submenu */}
            <div className={`overflow-hidden transition-all duration-200 ${
              mobileServicesOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  href="/otw/rides"
                  className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => {
                    setIsOpen(false);
                    setMobileServicesOpen(false);
                  }}
                >
                  Ride Services
                </Link>
                <Link
                  href="/otw/grocery-delivery"
                  className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => {
                    setIsOpen(false);
                    setMobileServicesOpen(false);
                  }}
                >
                  Grocery Delivery
                </Link>
                <Link
                  href="/otw/package"
                  className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => {
                    setIsOpen(false);
                    setMobileServicesOpen(false);
                  }}
                >
                  Package Delivery
                </Link>
                <Link
                  href="/otw"
                  className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-sm font-medium border-t border-white/10 mt-1 pt-2"
                  onClick={() => {
                    setIsOpen(false);
                    setMobileServicesOpen(false);
                  }}
                >
                  All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
