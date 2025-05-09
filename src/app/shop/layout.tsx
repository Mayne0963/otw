"use client"

import { CartProvider } from "../../lib/context/CartContext"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
} 