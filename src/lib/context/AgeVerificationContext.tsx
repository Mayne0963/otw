"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface AgeVerificationContextType {
  isVerified: boolean
  verifyAge: () => void
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined)

export function AgeVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Check if age verification is stored in localStorage
    const storedVerification = localStorage.getItem("ageVerified")
    if (storedVerification === "true") {
      setIsVerified(true)
    }
  }, [])

  const verifyAge = () => {
    setIsVerified(true)
    localStorage.setItem("ageVerified", "true")
  }

  return (
    <AgeVerificationContext.Provider value={{ isVerified, verifyAge }}>
      {children}
    </AgeVerificationContext.Provider>
  )
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext)
  if (context === undefined) {
    throw new Error("useAgeVerification must be used within an AgeVerificationProvider")
  }
  return context
}
