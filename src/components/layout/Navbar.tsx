'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Home,
  Utensils,
  Car,
  MapPin,
  Crown,
  HelpingHand,
  Camera,
  ChevronDown,
  ShoppingBag,
  Trophy,
  Users,
  Briefcase,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../lib/context/CartContext';
import { Button } from '../ui/button';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { cn } from '../../lib/utils';
import Image from 'next/image';

const mainNavItems = [
  {
    name: 'Services',
    href: '/otw',
    icon: <Car className="mr-3 h-4 w-4" />,
  },
  {
    name: 'Broskis Kitchen',
    href: '/broskis',
    icon: <Utensils className="mr-3 h-4 w-4" />,
  },
  {
    name: 'Hall of Hustle',
    href: '/hall-of-hustle',
    icon: <Trophy className="mr-3 h-4 w-4" />,
  },
  {
    name: 'Catering',
    href: '/catering',
    icon: <Camera className="mr-3 h-4 w-4" />,
  },
  {
    name: 'Loyalty',
    href: '/loyalty',
    icon: <Crown className="mr-3 h-4 w-4" />,
  },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));
  useOnClickOutside(dropdownRef, () => setServicesDropdownOpen(false));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setServicesDropdownOpen(false);
        setMobileServicesOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-otw-black-950/95 via-otw-black-900/95 to-otw-black-950/95 backdrop-blur-xl border-b border-otw-gold-500/30 shadow-2xl shadow-otw-black/50">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8 lg:py-6"
        aria-label="Global"
      >
        {/* Enhanced Logo Section */}
        <div className="flex lg:flex-1">
          <Link href="/" className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105">
            <span className="sr-only">On The Way Delivery</span>

            {/* Logo Container with Enhanced Styling */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-otw-gold-500/20 rounded-xl blur-lg group-hover:bg-otw-gold-500/40 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

              {/* Logo Background */}
              <div className="relative bg-gradient-to-br from-otw-gold-500/20 via-otw-gold-600/30 to-otw-gold-700/20 p-2 rounded-xl border border-otw-gold-500/30 group-hover:border-otw-gold-400/50 transition-all duration-300 shadow-lg">
                <Image
                  className="h-10 w-auto relative z-10 transition-all duration-300 group-hover:scale-110 filter brightness-110"
                  src="/assets/logos/otw-logo-new-red-transparent.png"
                  alt="On The Way Delivery"
                  width={140}
                  height={40}
                  priority
                />
              </div>
            </div>

            {/* Enhanced Text Logo */}
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-otw-gold-400 via-otw-gold-500 to-otw-gold-600 bg-clip-text text-transparent tracking-wider font-['Bebas_Neue'] group-hover:from-otw-gold-300 group-hover:to-otw-gold-500 transition-all duration-300">
                OTW
              </span>
              <span className="text-xs text-otw-gold-600/80 font-medium tracking-[0.2em] uppercase transition-colors duration-300 group-hover:text-otw-gold-500/90">
                On The Way
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="relative -m-2.5 inline-flex items-center justify-center rounded-xl p-3 text-white/70 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 transition-all duration-300 border border-transparent hover:border-otw-gold-500/30"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Enhanced Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-2">
          {mainNavItems.map((item) => {
            if (item.name === 'Services') {
              return (
                <div key={item.name} className="relative" ref={dropdownRef}>
                  <button
                    className={cn(
                      'relative px-4 py-3 text-sm font-semibold leading-6 transition-all duration-300 rounded-xl group flex items-center',
                      pathname === item.href
                        ? 'text-otw-gold-400 bg-otw-gold-500/15 border border-otw-gold-500/40 shadow-lg shadow-otw-gold-500/10'
                        : 'text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30',
                    )}
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <ChevronDown className={cn(
                      'ml-1 h-4 w-4 transition-transform duration-200',
                      servicesDropdownOpen ? 'rotate-180' : '',
                    )} />
                  </button>

                  {/* Services Dropdown */}
                  <div
                    className={cn(
                      'absolute top-full left-0 mt-2 w-64 bg-otw-black-900/95 backdrop-blur-xl border border-otw-gold-500/30 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden',
                      servicesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2',
                    )}
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <div className="py-2">
                      <Link
                        href="/otw/rides"
                        className="flex items-center px-4 py-3 text-sm text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 transition-all duration-200 border-b border-otw-gold-500/10 last:border-b-0"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        <Car className="mr-3 h-4 w-4" />
                        <div>
                          <div className="font-medium">Ride Services</div>
                          <div className="text-xs text-white/60">Quick & reliable rides</div>
                        </div>
                      </Link>
                      <Link
                        href="/otw/grocery-delivery"
                        className="flex items-center px-4 py-3 text-sm text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 transition-all duration-200 border-b border-otw-gold-500/10 last:border-b-0"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        <ShoppingBag className="mr-3 h-4 w-4" />
                        <div>
                          <div className="font-medium">Grocery Delivery</div>
                          <div className="text-xs text-white/60">Fresh groceries delivered</div>
                        </div>
                      </Link>
                      <Link
                        href="/otw/package"
                        className="flex items-center px-4 py-3 text-sm text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 transition-all duration-200"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        <MapPin className="mr-3 h-4 w-4" />
                        <div>
                          <div className="font-medium">Package Delivery</div>
                          <div className="text-xs text-white/60">Same-day package delivery</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative px-4 py-3 text-sm font-semibold leading-6 transition-all duration-300 rounded-xl group',
                  pathname === item.href
                    ? 'text-otw-gold-400 bg-otw-gold-500/15 border border-otw-gold-500/40 shadow-lg shadow-otw-gold-500/10'
                    : 'text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30',
                )}
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-otw-gold-500/0 via-otw-gold-500/5 to-otw-gold-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Enhanced Right Side Actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative -m-2.5 p-3 text-white/70 hover:text-otw-gold-400 transition-all duration-300 rounded-xl hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30"
          >
            <span className="sr-only">Shopping cart</span>
            <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-otw-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-x-3">
              <Link
                href="/profile"
                className="-m-2.5 p-3 text-white/70 hover:text-otw-gold-400 transition-all duration-300 rounded-xl hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30"
              >
                <span className="sr-only">Profile</span>
                <User className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-otw-gold-500/30 text-white/80 hover:text-otw-gold-400 hover:border-otw-gold-400 hover:bg-otw-gold-500/10 transition-all duration-300 rounded-xl"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-x-3">
              <Link
                href="/signin"
                className="text-sm font-semibold leading-6 text-white/80 hover:text-otw-gold-400 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-otw-gold-500/10"
              >
                Sign in
              </Link>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-otw-gold-500/40 text-otw-gold-400 hover:text-otw-black-950 hover:bg-otw-gold-500 hover:border-otw-gold-500 transition-all duration-300 rounded-xl font-semibold"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Mobile menu */}
      <div
        className={cn(
          'lg:hidden',
          mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden',
        )}
      >
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div
          ref={mobileMenuRef}
          className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-b from-otw-black-900/98 to-otw-black-950/98 backdrop-blur-xl px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-otw-gold-500/30 sm:shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="sr-only">On The Way Delivery</span>
              <div className="relative">
                <div className="absolute inset-0 bg-otw-gold-500/20 rounded-lg blur-md group-hover:bg-otw-gold-500/30 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-otw-gold-500/20 to-otw-gold-600/20 p-2 rounded-lg border border-otw-gold-500/30">
                  <Image
                    className="h-8 w-auto filter brightness-110"
                    src="/assets/logos/otw-logo-new-red-transparent.png"
                    alt="On The Way Delivery"
                    width={120}
                    height={32}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-otw-gold-400 to-otw-gold-600 bg-clip-text text-transparent tracking-wide font-['Bebas_Neue']">
                  OTW
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-xl p-3 text-white/70 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 transition-all duration-300 border border-transparent hover:border-otw-gold-500/30"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-otw-gold-500/20">
              <div className="space-y-3 py-6">
                {mainNavItems.map((item) => {
                  if (item.name === 'Services') {
                    return (
                      <div key={item.name} className="space-y-2">
                        <button
                          className={cn(
                            '-mx-3 flex items-center justify-between rounded-xl px-4 py-4 text-base font-semibold leading-7 transition-all duration-300 border w-full',
                            pathname === item.href
                              ? 'text-otw-gold-400 bg-otw-gold-500/15 border-otw-gold-500/40 shadow-lg shadow-otw-gold-500/10'
                              : 'text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border-transparent hover:border-otw-gold-500/30 hover:shadow-md',
                          )}
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        >
                          <div className="flex items-center">
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="ml-1">{item.name}</span>
                          </div>
                          <ChevronDown className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            mobileServicesOpen ? 'rotate-180' : '',
                          )} />
                        </button>
                        
                        {/* Mobile Services Submenu */}
                        <div className={cn(
                          'overflow-hidden transition-all duration-300',
                          mobileServicesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        )}>
                          <div className="ml-6 space-y-2 border-l border-otw-gold-500/20 pl-4">
                            <Link
                              href="/otw/rides"
                              className="flex items-center px-3 py-3 text-sm text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 rounded-lg transition-all duration-200"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                              }}
                            >
                              <Car className="mr-3 h-4 w-4" />
                              <div>
                                <div className="font-medium">Ride Services</div>
                                <div className="text-xs text-white/60">Quick & reliable rides</div>
                              </div>
                            </Link>
                            <Link
                              href="/otw/grocery-delivery"
                              className="flex items-center px-3 py-3 text-sm text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 rounded-lg transition-all duration-200"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                              }}
                            >
                              <ShoppingBag className="mr-3 h-4 w-4" />
                              <div>
                                <div className="font-medium">Grocery Delivery</div>
                                <div className="text-xs text-white/60">Fresh groceries delivered</div>
                              </div>
                            </Link>
                            <Link
                              href="/otw/package"
                              className="flex items-center px-3 py-3 text-sm text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 rounded-lg transition-all duration-200"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                              }}
                            >
                              <MapPin className="mr-3 h-4 w-4" />
                              <div>
                                <div className="font-medium">Package Delivery</div>
                                <div className="text-xs text-white/60">Same-day package delivery</div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        '-mx-3 flex items-center rounded-xl px-4 py-4 text-base font-semibold leading-7 transition-all duration-300 border',
                        pathname === item.href
                          ? 'text-otw-gold-400 bg-otw-gold-500/15 border-otw-gold-500/40 shadow-lg shadow-otw-gold-500/10'
                          : 'text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border-transparent hover:border-otw-gold-500/30 hover:shadow-md',
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="ml-1">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="py-6">
                {/* Cart Link for Mobile */}
                <Link
                  href="/cart"
                  className="-mx-3 flex items-center rounded-xl px-4 py-4 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30 hover:shadow-md transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex-shrink-0 relative">
                    <ShoppingCart className="mr-3 h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-otw-red text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </span>
                  <span>Cart {itemCount > 0 && `(${itemCount})`}</span>
                </Link>
                
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="-mx-3 flex items-center rounded-xl px-4 py-4 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30 hover:shadow-md transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex-shrink-0"><User className="mr-3 h-5 w-5" /></span>
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="-mx-3 flex w-full text-left rounded-xl px-4 py-4 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30 hover:shadow-md transition-all duration-300"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="-mx-3 block rounded-xl px-4 py-4 text-base font-semibold leading-7 text-white/80 hover:text-otw-gold-400 hover:bg-otw-gold-500/10 border border-transparent hover:border-otw-gold-500/30 hover:shadow-md transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="-mx-3 block rounded-xl px-4 py-4 text-base font-semibold leading-7 text-otw-gold-400 bg-otw-gold-500/15 border border-otw-gold-500/40 hover:bg-otw-gold-500/25 hover:shadow-lg transition-all duration-300 mt-3"
                      onClick={() => setMobileMenuOpen(false)}
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
