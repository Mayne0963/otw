"use client"

import { useState, useEffect } from "react"

export default function AnimatedSection({ children, delay = 0, direction = "up" }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransformClass = () => {
    if (!isVisible) {
      switch (direction) {
        case "up":
          return "translate-y-10"
        case "down":
          return "translate-y-[-10px]"
        case "left":
          return "translate-x-10"
        case "right":
          return "translate-x-[-10px]"
        default:
          return "translate-y-10"
      }
    }
    return "translate-y-0 translate-x-0"
  }

  return (
    <div
      className={`transition-all duration-1000 transform ${getTransformClass()} ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  )
}
