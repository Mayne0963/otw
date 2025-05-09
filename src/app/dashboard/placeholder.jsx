"use client"

import Link from "next/link"

export default function DashboardPlaceholder() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard Coming Soon</h1>
        <p className="text-gray-300 mb-6">
          We're currently building this feature. The dashboard will allow you to track your orders, manage your tier
          membership, and more.
        </p>
        <div className="bg-primary-red p-4 rounded-lg mb-6">
          <p className="text-white">
            <strong>Features planned:</strong>
          </p>
          <ul className="text-left mt-2 space-y-1">
            <li>• Order history and tracking</li>
            <li>• Tier membership management</li>
            <li>• Favorite representatives</li>
            <li>• Payment methods</li>
            <li>• Account settings</li>
          </ul>
        </div>
        <Link href="/" className="btn-primary inline-flex items-center justify-center">
          Return to Home
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
