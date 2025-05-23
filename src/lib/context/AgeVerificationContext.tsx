"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AgeVerificationContextType {
  isVerified: boolean;
  verifyAge: (month?: number | string, year?: number | string) => Promise<void>;
}

const AgeVerificationContext = createContext<
  AgeVerificationContextType | undefined
>(undefined);

export function AgeVerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if age verification is stored in localStorage
    const storedVerification = localStorage.getItem("ageVerified");
    if (storedVerification === "true") {
      setIsVerified(true);
    }
  }, []);

  const verifyAge = async (
    month?: number | string,
    year?: number | string,
  ): Promise<void> => {
    // Store verification data if month and year are provided
    if (month && year) {
      try {
        localStorage.setItem("verificationMonth", String(month));
        localStorage.setItem("verificationYear", String(year));
      } catch (error) {
        console.error("Error storing verification data:", error);
      }
    }

    setIsVerified(true);
    localStorage.setItem("ageVerified", "true");
    return Promise.resolve();
  };

  return (
    <AgeVerificationContext.Provider value={{ isVerified, verifyAge }}>
      {children}
    </AgeVerificationContext.Provider>
  );
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error(
      "useAgeVerification must be used within an AgeVerificationProvider",
    );
  }
  return context;
}
