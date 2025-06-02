import { Metadata } from "next";
import BroskisOrderPage from "./BroskisOrderPage";

export const metadata: Metadata = {
  title: "Broski's Kitchen | OTW",
  description:
    "Order luxury street gourmet cuisine from Broski's Kitchen, delivered by OTW.",
};

export const dynamic = "force-dynamic";

export default function RestaurantsPage() {
  return <BroskisOrderPage />;
}
