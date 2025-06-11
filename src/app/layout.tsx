import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartProvider } from '@/lib/context/CartContext';

import { ToastContainer } from '../components/ui/toast';
import { ScrollToTop } from '../components/ui/scroll-to-top';
import { cn } from '../lib/utils';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'On The Way Delivery',
  description:
    "Fort Wayne's all-in-one platform for food, groceries, and rides",
  icons: {
    icon: '/assets/logos/favicon.ico',
  },
  keywords: [
    'delivery',
    'food delivery',
    'grocery delivery',
    'rides',
    'Fort Wayne',
    'OTW',
    'On The Way',
  ],
  authors: [{ name: 'On The Way Delivery' }],
  openGraph: {
    type: 'website',
    title: 'On The Way Delivery',
    description:
      "Fort Wayne's all-in-one platform for food, groceries, and rides",
    siteName: 'On The Way Delivery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On The Way Delivery',
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
          'font-sans antialiased bg-gradient-to-br from-otw-black via-otw-black-900 to-otw-black text-white min-h-screen flex flex-col',
        )}
      >
        <CartProvider>
          <Providers>
            {/* Enhanced Background with OTW branding */}
            <div className="fixed inset-0 pointer-events-none z-0">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-otw-black via-otw-black-900 to-otw-black-950" />
              
              {/* Subtle pattern overlay */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, #d4af37 1px, transparent 1px)`,
                  backgroundSize: '50px 50px',
                }}
              />
              
              {/* OTW logo full background */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'url(/images/otw-logo.png)',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  filter: 'brightness(0.4) contrast(1.5)',
                }}
              />
            </div>

            {/* Main content with enhanced styling */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-20 relative">
                {/* Content backdrop for better readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-otw-black/20 to-transparent pointer-events-none" />
                <div className="relative z-10">{children}</div>
              </main>
              <Footer className="bg-gradient-to-r from-otw-black/90 via-otw-black-900/90 to-otw-black/90 border-t border-otw-gold/20 backdrop-blur-sm" />
            </div>

            {/* Enhanced UI Components */}
            <ScrollToTop />
            <ToastContainer />
          </Providers>
        </CartProvider>
      </body>
    </html>
  );
}
