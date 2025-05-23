"use client";

import { useState, useEffect } from "react";

export default function ResponsiveWrapper({ children }) {
  const [screenSize, setScreenSize] = useState("");

  useEffect(() => {
    // Function to update screen size
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("mobile");
      } else if (width < 768) {
        setScreenSize("sm");
      } else if (width < 1024) {
        setScreenSize("md");
      } else if (width < 1280) {
        setScreenSize("lg");
      } else {
        setScreenSize("xl");
      }
    };

    // Set initial screen size
    updateScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", updateScreenSize);

    // Clean up event listener
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return (
    <div className="responsive-wrapper">
      {children}

      {/* Screen size indicator (only visible in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-2 right-2 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono z-50 border border-primary-red">
          {screenSize}
        </div>
      )}
    </div>
  );
}
