"use client";

import { useState } from "react";
import Link from "next/link";

export default function EnhancedButton({
  href,
  variant = "primary",
  children,
  className = "",
  fullWidth = false,
  glow = true,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses =
    "relative font-bold py-3 px-8 rounded-md transition-all duration-300 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden";

  const variantClasses = {
    primary: `
      bg-[#C1272D] text-white hover:bg-[#D1373D] focus:ring-[#C1272D]
      ${glow ? "shadow-lg shadow-[#FFD700]/50 hover:shadow-[#FFD700]/70" : ""}
      transform hover:-translate-y-1
    `,
    secondary: `
      bg-[#FFD700] text-black hover:bg-[#FFDF20] focus:ring-[#FFD700]
      ${glow ? "shadow-lg shadow-[#C1272D]/50 hover:shadow-[#C1272D]/70" : ""}
      transform hover:-translate-y-1
    `,
  };

  const widthClass = fullWidth ? "w-full" : "";
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`;

  // Add subtle particle effect on hover
  const renderParticles = () => {
    if (!isHovered) return null;

    return (
      <span className="absolute inset-0 pointer-events-none">
        {variant === "primary" && (
          <span className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-[#FFD700] animate-ping"></span>
        )}
        {variant === "secondary" && (
          <span className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-[#C1272D] animate-ping"></span>
        )}
      </span>
    );
  };

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {renderParticles()}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {renderParticles()}
      {children}
    </button>
  );
}
