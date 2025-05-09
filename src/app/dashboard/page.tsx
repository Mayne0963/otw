import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import OrderHistory from "../../components/dashboard/OrderHistory"
import Favorites from "../../components/dashboard/Favorites"
import TierPerks from "../../components/dashboard/TierPerks"

export const metadata: Metadata = {
  title: "Dashboard | OTW",
  description: "Manage your OTW account, view order history, and access tier perks.",
}

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold text-otw-gold">Dashboard</h1>
          <p className="text-lg text-gray-300">Manage your OTW experience and track your community impact.</p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="perks">Tier Perks</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="favorites">
            <Favorites />
          </TabsContent>

          <TabsContent value="perks">
            <TierPerks />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
