'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useCart } from '../../../lib/context/CartContext';

interface OrderDetails {
  id: string;
  amount_total: number;
  customer_details: {
    email: string;
    name?: string;
  };
  metadata: {
    orderType?: string;
    phone?: string;
    deliveryAddress?: string;
    pickupLocation?: string;
    deliveryTime?: string;
    scheduledTime?: string;
  };
  line_items: {
    data: Array<{
      description: string;
      quantity: number;
      amount_total: number;
    }>;
  };
}

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Fetch order details from Stripe session
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrderDetails(data);

        // Clear cart after successful payment
        clearCart();
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-gold-foil mx-auto mb-4" />
          <p className="text-lg">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 text-red-400 p-6 rounded-lg mb-6">
            <h1 className="text-2xl font-bold mb-2">Error</h1>
            <p>{error}</p>
          </div>
          <Link href="/cart" className="btn-primary">
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-400">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        {orderDetails && (
          <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] overflow-hidden">
            <div className="bg-[#111111] p-6 border-b border-[#333333]">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <p className="text-gray-400 mt-1">
                Order ID: <span className="text-gold-foil">{orderDetails.id}</span>
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order Type:</span>
                      <span className="capitalize">
                        {orderDetails.metadata.orderType || 'Delivery'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span>{orderDetails.customer_details.email}</span>
                    </div>
                    {orderDetails.metadata.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span>{orderDetails.metadata.phone}</span>
                      </div>
                    )}
                    {orderDetails.metadata.deliveryAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery Address:</span>
                        <span className="text-right">
                          {orderDetails.metadata.deliveryAddress}
                        </span>
                      </div>
                    )}
                    {orderDetails.metadata.pickupLocation && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pickup Location:</span>
                        <span>{orderDetails.metadata.pickupLocation}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delivery Time:</span>
                      <span className="capitalize">
                        {orderDetails.metadata.deliveryTime === 'asap'
                          ? 'As Soon As Possible'
                          : orderDetails.metadata.scheduledTime || 'ASAP'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Items Ordered</h3>
                  <div className="space-y-3">
                    {orderDetails.line_items.data.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          ${(item.amount_total / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}

                    <div className="border-t border-[#333333] pt-3 mt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-gold-foil">
                          ${(orderDetails.amount_total / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#333333]">
                <div className="bg-[#111111] p-4 rounded-lg">
                  <h4 className="font-bold mb-2">What&apos;s Next?</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• You&apos;ll receive an email confirmation shortly</li>
                    <li>• We&apos;ll notify you when your order is being prepared</li>
                    <li>• Estimated delivery/pickup time: 30-45 minutes</li>
                    <li>• Track your order status in your account</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link href="/" className="btn-outline text-center">
            Return to Home
          </Link>
          <Link href="/menu" className="btn-primary text-center">
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
}