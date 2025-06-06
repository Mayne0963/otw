'use client';

import { RewardsProvider } from '../../lib/context/RewardsContext';
import { AuthProvider } from '../../contexts/AuthContext';

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
