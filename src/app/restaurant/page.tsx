import { Metadata } from "next";
import RestaurantPageContent from "./RestaurantPageContent";

export const metadata: Metadata = {
  title: "Restaurant | On The Way",
  description: "Find and order from your favorite restaurants",
};

export const dynamic = "force-dynamic";

export default function RestaurantPage() {
  return <RestaurantPageContent />;
}
