"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { X } from "lucide-react"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie-consent")
    if (!hasConsented) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all")
    setIsVisible(false)
  }

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-otw-black-900 border-t border-otw-black-800 p-4 md:p-6 shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">We value your privacy</h3>
            <p className="text-sm text-gray-400 mb-2">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
              traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
            <a href="/privacy-policy" className="text-sm text-otw-gold-600 hover:underline">
              Read our Cookie Policy
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button variant="outline" size="sm" onClick={acceptEssential} className="whitespace-nowrap">
              Essential Only
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={acceptAll}
              className="whitespace-nowrap bg-otw-gold-600 hover:bg-otw-gold-700"
            >
              Accept All
            </Button>
            <Button variant="ghost" size="icon" onClick={acceptEssential} className="absolute top-2 right-2 md:hidden">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
