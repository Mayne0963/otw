"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Logo } from "./ui/logo";
import { Button } from "./ui/button";
import { RefreshCw, Instagram, Twitter, Facebook } from "lucide-react";

interface MaintenanceModeProps {
  children: ReactNode;
}

export function MaintenanceMode({ children }: MaintenanceModeProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 2,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Check if maintenance mode is enabled
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
    setIsMaintenanceMode(maintenanceMode);

    // Set up countdown timer if in maintenance mode
    if (maintenanceMode) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const totalSeconds =
            prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;

          if (totalSeconds <= 0) {
            clearInterval(interval);
            return { hours: 0, minutes: 0, seconds: 0 };
          }

          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          return { hours, minutes, seconds };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  if (!isMaintenanceMode) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-8">
          <Logo size="large" variant="default" />
        </div>

        <h1 className="text-3xl font-bold mb-4">We&apos;ll be right back!</h1>

        <p className="text-gray-400 mb-8">
          We&apos;re currently performing scheduled maintenance to improve your
          experience. Please check back soon.
        </p>

        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Estimated completion</h2>

          <div className="flex justify-center gap-4 text-center">
            <div className="bg-otw-black-800 rounded-md p-3 w-20">
              <div className="text-2xl font-bold">
                {timeRemaining.hours.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-500">HOURS</div>
            </div>
            <div className="bg-otw-black-800 rounded-md p-3 w-20">
              <div className="text-2xl font-bold">
                {timeRemaining.minutes.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-500">MINUTES</div>
            </div>
            <div className="bg-otw-black-800 rounded-md p-3 w-20">
              <div className="text-2xl font-bold">
                {timeRemaining.seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-500">SECONDS</div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="mb-8 hover:bg-otw-gold/20 transition-colors"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh page
        </Button>

        <div className="text-sm text-gray-500">
          <p className="mb-4">Follow us for updates:</p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://instagram.com/otw"
              className="hover:text-otw-gold transition-colors duration-200"
              style={{
                transitionProperty: "transform",
                transitionDuration: "200ms",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://twitter.com/otw"
              className="hover:text-otw-gold-600 transition-colors"
            >
              <Twitter size={24} />
            </a>
            <a
              href="https://facebook.com/otw"
              className="hover:text-otw-gold-600 transition-colors"
            >
              <Facebook size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
