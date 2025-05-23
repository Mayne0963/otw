"use client";

import Link from "next/link";

export default function Button({
  href,
  variant = "primary",
  children,
  className = "",
  fullWidth = false,
  ...props
}) {
  const baseClasses =
    "font-bold py-2 px-6 rounded transition-all duration-300 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-[#C1272D] text-white hover:bg-opacity-90 focus:ring-[#C1272D] shadow-lg shadow-[#FFD700]/50 hover:shadow-[#FFD700]/70 transform hover:-translate-y-1",
    secondary:
      "bg-[#FFD700] text-black hover:bg-opacity-90 focus:ring-[#FFD700] shadow-lg shadow-[#C1272D]/50 hover:shadow-[#C1272D]/70 transform hover:-translate-y-1",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
