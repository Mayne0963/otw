"use client"

import Link from "next/link"

export default function ServiceCard({ icon, title, description, linkText, linkHref }) {
  return (
    <div className="service-card group">
      <div className="h-16 w-16 bg-primary-red rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-accent-gold transition-colors duration-300">{title}</h3>
      <p className="text-gray-300 mb-6">{description}</p>
      <Link
        href={linkHref}
        className="text-accent-gold group-hover:text-white flex items-center font-medium transition-colors duration-300"
      >
        {linkText}
        <svg
          className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </Link>
    </div>
  )
}
