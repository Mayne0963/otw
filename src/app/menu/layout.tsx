"use client";

import { CartProvider } from "../../lib/context/CartContext";
import { AgeVerificationProvider } from "../../lib/context/AgeVerificationContext";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgeVerificationProvider>
      <CartProvider>{children}</CartProvider>
    </AgeVerificationProvider>
  );
}
