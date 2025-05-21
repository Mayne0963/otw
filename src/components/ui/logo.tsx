import Image from "next/image"
import Link from "next/link"
import { cn } from "../../lib/utils"

interface LogoProps {
  size?: "small" | "medium" | "large"
  variant?: "default" | "transparent"
  href?: string
  className?: string
  alt?: string
}

export function Logo({ size = "medium", href, className, alt = "On The Way Logo" }: LogoProps) {
  // Use the transparent background logo for best appearance
  const logoSrc = "/assets/logos/otw-logo-new-red-transparent.png"

  const sizeClasses = {
    small: "h-8 w-28",
    medium: "h-12 w-40",
    large: "h-16 w-52",
  }

  const logoComponent = (
    <div className={cn("relative group", sizeClasses[size], className)}>
      <Image 
        src={logoSrc} 
        alt={alt} 
        fill 
        className="object-contain" 
        priority 
        sizes="(max-width: 640px) 112px, (max-width: 768px) 160px, 208px"
      />
      {/* Tooltip */}
      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 px-3 py-1 rounded bg-otw-black-900 text-xs text-otw-gold-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-otw-md">
        Powered by Thee Motion of the People
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoComponent}
      </Link>
    )
  }

  return logoComponent
}
