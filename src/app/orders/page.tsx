'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useEffect } from 'react';
import OrderHistory from '../../components/dashboard/OrderHistory';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-otw-black-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-otw-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-otw-black-900">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view your orders.</p>
          <Link href="/signin" className="text-otw-gold hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-otw-black-900 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
            <p className="text-gray-400">Track and manage all your orders</p>
          </div>
          <Link
            href="/dashboard"
            className="text-otw-gold hover:text-otw-gold/80 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg border border-otw-black-700 hover:border-otw-gold/30"
          >
            <FaArrowLeft className="w-4 h-4" /> 
            Back to Dashboard
          </Link>
        </div>

        <OrderHistory />
      </div>
    </div>
  );
}
