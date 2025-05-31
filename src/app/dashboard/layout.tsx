"use client";

import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useState } from "react";
import DashboardNavbar from "../../components/dashboard/dashboard-navbar";
import DashboardSidebar from "../../components/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State for sidebar toggle on mobile devices
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <DashboardNavbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        {/* Mobile sidebar */}
        <div
          className={`lg:hidden ${isSidebarOpen ? "block" : "hidden"} fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside
          className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex w-64 flex-col fixed inset-y-0 pt-16 z-30 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex-1 flex flex-col min-h-0 bg-[#1A1A1A] border-r border-white/10">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <DashboardSidebar />
            </div>
          </div>
        </aside>
        <main className="lg:pl-64 flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
