"use client";

import type React from "react";

import { ThemeProvider } from "../../components/theme-provider";
import { UserProvider } from "./UserContext";
import { CartProvider } from "./CartContext";
import { DeliveryProvider } from "./DeliveryContext";
import { AgeVerificationProvider } from "./AgeVerificationContext";
import { RewardsProvider } from "./RewardsContext";
import { ChatProvider } from "./ChatContext";
import { MediaPlayerProvider } from "./MediaPlayerContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { ErrorBoundary } from "../../components/ui/error-boundary";
import { AnalyticsScript } from "../../components/analytics-script";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <UserProvider>
            <CartProvider>
              <DeliveryProvider>
                <AgeVerificationProvider>
                  <RewardsProvider>
                    <ChatProvider>
                      <MediaPlayerProvider>
                        <AnalyticsScript />
                        {children}
                      </MediaPlayerProvider>
                    </ChatProvider>
                  </RewardsProvider>
                </AgeVerificationProvider>
              </DeliveryProvider>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
