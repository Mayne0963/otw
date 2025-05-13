"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, X, ChevronRight, Trash2 } from "lucide-react"
import { useCart } from "../../lib/context/CartContext"
import { useOnClickOutside } from "../../hooks/useOnClickOutside"
import Button from "../Button"

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, itemCount, removeItem, updateQuantity, total } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false))

  // Close dropdown when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-4 py-2 text-white hover:text-otw-gold-600 transition-colors relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-otw-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-otw-black-900 rounded-md shadow-otw-md z-50 border border-otw-black-800 overflow-hidden">
          <div className="p-4 border-b border-otw-black-800 flex justify-between items-center">
            <h3 className="font-medium">Your Cart ({itemCount})</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close cart">
              <X className="h-4 w-4" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">Your cart is empty</p>
              <Link href="/restaurants" className="inline-block w-full" onClick={() => setIsOpen(false)}>
                <Button variant="primary" size="sm">
                  Browse Restaurants
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto p-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-otw-black-800 rounded-md transition-colors"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-gray-400 text-xs">${item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-1">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="h-6 w-6 flex items-center justify-center bg-otw-black-800 rounded-md text-sm"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="mx-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 flex items-center justify-center bg-otw-black-800 rounded-md text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-otw-red-600 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-otw-black-800">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="flex items-center justify-between w-full bg-otw-red-600 text-white py-2 px-4 rounded-md hover:bg-otw-red-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">Checkout</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  className="w-full text-center mt-2 text-sm text-gray-400 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
