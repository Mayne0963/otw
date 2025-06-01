"use client";

import Link from "next/link";

export default function HallOfHustlePlaceholder() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Hall of Hustle</h1>
        <p className="text-gray-300 mb-6">
          Celebrating our outstanding delivery team members who go above and
          beyond to serve the Fort Wayne community with excellence.
        </p>
        <div className="bg-otw-gold bg-opacity-20 p-4 rounded-lg mb-6">
          <p className="text-white">
            <strong>Recognition Features:</strong>
          </p>
          <ul className="text-left mt-2 space-y-1">
            <li>• Top performer spotlights</li>
            <li>• Customer service excellence</li>
            <li>• Community involvement highlights</li>
            <li>• Service milestone achievements</li>
            <li>• Team member recommendations</li>
          </ul>
        </div>
        <Link
          href="/"
          className="btn-primary inline-flex items-center justify-center"
        >
          Return to Home
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
