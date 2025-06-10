'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import Button from '../Button';

export default function CartDropdown() {
  const router = useRouter();

  const handleOrderNow = () => {
    router.push('/order');
  };

  return (
    <div className="relative">
      {/* Order Now Button */}
      <button
        onClick={handleOrderNow}
        className="relative p-2 text-white hover:text-gold-foil transition-colors duration-200"
        aria-label="Order now"
      >
        <ShoppingBag className="h-6 w-6" />
      </button>
    </div>
  );
}
