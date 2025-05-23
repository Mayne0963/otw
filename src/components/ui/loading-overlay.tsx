"use client";

import { useEffect, useState } from "react";
import { LoadingAnimation } from "./loading-animation";
import { cn } from "../../lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
  fullScreen?: boolean;
  message?: string;
  subMessage?: string;
  minDisplayTime?: number;
}

export function LoadingOverlay({
  isLoading,
  className,
  fullScreen = false,
  message = "Loading...",
  subMessage,
  minDisplayTime = 500,
}: LoadingOverlayProps) {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [isLoading, minDisplayTime]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300",
        fullScreen ? "fixed inset-0" : "absolute inset-0",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center p-6 rounded-lg">
        <LoadingAnimation
          size={fullScreen ? "large" : "medium"}
          showText={true}
          text={message}
          subText={subMessage}
        />
      </div>
    </div>
  );
}
