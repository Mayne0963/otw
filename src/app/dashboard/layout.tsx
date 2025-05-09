"use client"

import { useState } from "react"
import DashboardNavbar from "../../components/dashboard/dashboard-navbar"
import DashboardSidebar from "../../components/dashboard/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <DashboardNavbar />
      <div className="flex">
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 pt-16">
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
  )
}
