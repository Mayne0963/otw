'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingBag } from 'react-icons/fa';

export default function CartPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to order page since cart functionality has been removed
    router.push('/order');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <FaShoppingBag className="text-6xl text-gold-foil mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Cart Removed</h1>
        <p className="text-gray-400 mb-4">We've simplified the ordering process. You'll be redirected to our menu.</p>
      </div>
    </div>
  );
}
