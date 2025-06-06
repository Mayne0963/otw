'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
import { GoogleMapsProvider } from '../contexts/GoogleMapsContext';
import { Toaster } from '../components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <GoogleMapsProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </GoogleMapsProvider>
    </ThemeProvider>
  );
}
