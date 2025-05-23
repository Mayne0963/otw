"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "../../lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className={cn(
        "fixed bottom-4 right-4 z-40 p-2 rounded-full bg-otw-gold text-otw-black shadow-otw transition-all duration-300 hover:bg-otw-gold-600 focus:outline-none focus:ring-2 focus:ring-otw-gold focus:ring-offset-2",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
      )}
      onClick={scrollToTop}
    >
      <ArrowUp className="h-5 w-5" />
      <span className="sr-only">Scroll to top</span>
    </button>
  );
}
