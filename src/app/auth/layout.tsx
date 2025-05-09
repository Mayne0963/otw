"use client"

import dynamic from 'next/dynamic'

const AuthProvider = dynamic(() => import('../../lib/context/AuthContext').then(mod => mod.AuthProvider), {
  ssr: false
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
} 