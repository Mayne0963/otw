'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';


export default function CashOrderSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Get order data from URL params or localStorage
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      // If no order ID, redirect to home
      router.push('/');
      return;
    }

    // Try to get order data from localStorage (set during checkout)
    const storedOrderData = localStorage.getItem(`order_${orderId}`);
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
      // Clear the stored data after retrieving it
      localStorage.removeItem(`order_${orderId}`);
    }

    // Order completed successfully
  }, [searchParams, router]);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading order details...</p>
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
          <p className="text-xl text-gray-400 mb-4">
            Your cash on arrival order has been placed successfully.
          </p>
          <div className="flex items-center justify-center gap-2 text-gold-foil">
            <FaMoneyBillWave className="text-2xl" />
            <span className="text-lg font-semibold">Payment on Arrival</span>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] overflow-hidden">
          <div className="bg-[#111111] p-6 border-b border-[#333333]">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="text-gray-400 mt-1">
              Order ID: <span className="text-gold-foil">{orderData.orderId}</span>
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
                    <span className="capitalize">{orderData.orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span>{orderData.contactInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span>{orderData.contactInfo.phone}</span>
                  </div>
                  {orderData.orderType === 'delivery' && orderData.deliveryInfo && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delivery Address:</span>
                      <span className="text-right">
                        {orderData.deliveryInfo.firstName} {orderData.deliveryInfo.lastName}<br />
                        {orderData.deliveryInfo.streetAddress}<br />
                        {orderData.deliveryInfo.apartment && `${orderData.deliveryInfo.apartment}, `}
                        {orderData.deliveryInfo.city}, {orderData.deliveryInfo.state} {orderData.deliveryInfo.zipCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Time:</span>
                    <span className="capitalize">
                      {orderData.deliveryTime === 'asap'
                        ? 'As Soon As Possible'
                        : orderData.scheduledTime || 'ASAP'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-gold-foil font-semibold">Cash on Arrival</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.selectedOptions.map((option: any, optIndex: number) => (
                              <div key={optIndex}>
                                {option.name}: {option.choice}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t border-[#333333] pt-3 mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${orderData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${orderData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-gold-foil">
                        ${orderData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#333333]">
              <div className="bg-[#111111] p-4 rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <FaMoneyBillWave className="text-gold-foil" />
                  Payment Instructions
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Please have exact change ready: <strong className="text-gold-foil">${orderData.total.toFixed(2)}</strong></li>
                  <li>• Payment will be collected upon delivery/pickup</li>
                  <li>• We accept cash only for this payment method</li>
                  <li>• You'll receive a receipt with your order</li>
                </ul>
              </div>

              <div className="bg-[#111111] p-4 rounded-lg mt-4">
                <h4 className="font-bold mb-2">What&apos;s Next?</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• We&apos;re preparing your order now</li>
                  <li>• Estimated delivery/pickup time: 30-45 minutes</li>
                  <li>• We&apos;ll call you when your order is ready</li>
                  <li>• Keep your phone nearby for updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

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