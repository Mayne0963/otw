"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Home, Package, Settings, Camera } from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: Package,
    },
    {
      name: "Screenshot Orders",
      href: "/admin/screenshot-orders",
      icon: Camera,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
