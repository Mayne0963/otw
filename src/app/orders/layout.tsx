'use client';

import { AuthProvider } from '../../contexts/AuthContext';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
