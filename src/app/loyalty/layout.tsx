"use client";

import { RewardsProvider } from "../../lib/context/RewardsContext";
import { AuthProvider } from "../../lib/context/AuthContext";

export default function LoyaltyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RewardsProvider>{children}</RewardsProvider>
    </AuthProvider>
  );
}
