"use client";
import React from 'react';

import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

export function Header() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100
      setHasScrolled(scrolled)

      if (scrolled) {
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => {
          setIsVisible(true)
        }, 3000)
        setTimer(newTimer)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    }
  }, [timer])

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        hasScrolled ? 'bg-background/80 backdrop-blur-md border-b' : '',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Header content */}
      <div className="container flex h-16 items-center justify-between">
        <div className="font-bold text-xl">Your Logo</div>
        <nav className="flex space-x-4">
          {/* Navigation items */}
        </nav>
      </div>
    </header>
  )
}