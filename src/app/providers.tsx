'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
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
          {children}
            <Toaster />
        </AuthProvider>
      </ModernGoogleMapsProvider>
    </ThemeProvider>
  );
}
