import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = {
  main: [
    { name: 'Menu', href: '/menu' },
    { name: 'Locations', href: '/locations' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Help', href: '/help' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://facebook.com/otwdelivery',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/otwdelivery',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/otwdelivery',
      icon: Twitter,
    },
  ],
};

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('relative', className)}>
      {/* Enhanced background with OTW branding */}
      <div className="absolute inset-0 bg-gradient-to-t from-otw-black via-otw-black-900/95 to-transparent" />
      <div className="absolute inset-0 border-t border-otw-gold/20" />
      
      <div className="relative mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        {/* OTW Logo */}
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-otw-gold mb-2">On The Way</h3>
            <p className="text-sm text-white/70">Fort Wayne's Premier Delivery Service</p>
          </div>
        </div>
        
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link
                href={item.href}
                className="text-sm leading-6 text-white/80 hover:text-otw-gold transition-all duration-300 hover:scale-105 font-medium"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        
        <div className="mt-12 flex justify-center space-x-8">
          {navigation.social.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group text-white/70 hover:text-otw-gold transition-all duration-300 p-2 rounded-full hover:bg-otw-gold/10"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            </Link>
          ))}
        </div>
        
        {/* Enhanced copyright with OTW branding */}
        <div className="mt-12 pt-8 border-t border-otw-gold/10">
          <p className="text-center text-sm leading-6 text-white/60">
            &copy; {new Date().getFullYear()} <span className="text-otw-gold font-semibold">On The Way Delivery</span>. All rights reserved.
          </p>
          <p className="text-center text-xs leading-5 text-white/40 mt-2">
            Delivering excellence across Fort Wayne
          </p>
        </div>
      </div>
    </footer>
  );
}
