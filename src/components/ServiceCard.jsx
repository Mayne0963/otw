"use client";

import Link from "next/link";

export default function ServiceCard({
  icon,
  title,
  description,
  linkText,
  linkHref,
}) {
  return (
    <div className="luxe-card group">
      <div className="h-16 w-16 bg-gradient-to-br from-luxe-gold-dark to-luxe-gold-light rounded-lg flex items-center justify-center mb-6 transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-400 shadow-lg">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-luxe-gold-light transition-colors duration-400 tracking-wide text-luxe-text-off-white" style={{fontFamily: 'Playfair Display, serif'}}>
        {title}
      </h3>
      <p className="text-luxe-text-soft-gray mb-6 leading-relaxed">{description}</p>
      <Link
        href={linkHref}
        className="text-luxe-gold-dark group-hover:text-luxe-text-off-white flex items-center font-medium transition-all duration-400 tracking-wide text-sm"
        style={{fontFamily: 'Montserrat, sans-serif'}}
      >
        {linkText}
        <svg
          className="w-5 h-5 ml-2 transform group-hover:translate-x-1 group-hover:scale-105 transition-transform duration-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          ></path>
        </svg>
      </Link>
    </div>
  );
}
