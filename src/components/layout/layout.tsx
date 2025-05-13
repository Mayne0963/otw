"use client";
import React from 'react';

import { Header } from './header'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16"> {/* Add padding to prevent content overlap */}
        {children}
      </main>
    </div>
  )
}