'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { Menu } from 'lucide-react';

export default function DashboardNavbar({
  onMenuToggle,
}: {
  onMenuToggle?: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
    },
  ];

  return (
    <nav className="flex items-center justify-between px-4 h-16 border-b border-white/10 fixed left-0 right-0 bg-black z-40" style={{ top: 'var(--navbar-height)', height: 'var(--dashboard-navbar-height)' }}>
      <div className="flex items-center">
        <Link href="/dashboard" className="text-white font-bold text-xl mr-6">
          EZY-ZIP
        </Link>
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={onMenuToggle}
        className="md:hidden text-gray-300 hover:text-white focus:outline-none"
      >
        <Menu className="h-6 w-6" />
      </button>
    </nav>
  );
}
