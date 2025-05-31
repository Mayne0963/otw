"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gold-foil mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">Page Not Found</h2>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-gold-foil text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
