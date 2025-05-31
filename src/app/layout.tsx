import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CartProvider } from "../lib/context/CartContext";
import { ToastContainer } from "../components/ui/toast";
import { ScrollToTop } from "../components/ui/scroll-to-top";
import { cn } from "../lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "On The Way Delivery",
  description:
    "Fort Wayne's all-in-one platform for food, groceries, and rides",
  icons: {
    icon: "/assets/logos/favicon.ico",
  },
  keywords: [
    "delivery",
    "food delivery",
    "grocery delivery",
    "rides",
    "Fort Wayne",
    "OTW",
    "On The Way",
  ],
  authors: [{ name: "On The Way Delivery" }],
  openGraph: {
    type: "website",
    title: "On The Way Delivery",
    description:
      "Fort Wayne's all-in-one platform for food, groceries, and rides",
    siteName: "On The Way Delivery",
  },
  twitter: {
    card: "summary_large_image",
    title: "On The Way Delivery",
    description:
      "Fort Wayne's all-in-one platform for food, groceries, and rides",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          poppins.variable,
          "font-sans antialiased bg-gradient-to-br from-otw-black to-otw-black/95 text-white min-h-screen flex flex-col",
        )}
      >
        <CartProvider>
          <Providers>
            {/* Background pattern */}
            <div className="fixed inset-0 bg-[url('/assets/images/pattern.png')] opacity-5 pointer-events-none" />

            {/* Main content */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer className="bg-otw-black/80 border-t border-otw-gold/10" />
            </div>

            {/* UI Components */}
            <ScrollToTop />
            <ToastContainer />
          </Providers>
        </CartProvider>
      </body>
    </html>
  );
}
