'use client';

import ProtectedRoute from '../../../components/auth/ProtectedRoute';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/signin">
      {children}
    </ProtectedRoute>
  );
}