'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../lib/context/CartContext';
import { ModernGoogleMapsProvider } from '../contexts/ModernGoogleMapsContext';
import { Toaster } from '../components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ModernGoogleMapsProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </ModernGoogleMapsProvider>
    </ThemeProvider>
  );
}
