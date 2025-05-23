import { cn } from "../../lib/utils";

type LoadingSize = "small" | "medium" | "large";

interface LoadingAnimationProps {
  size?: LoadingSize;
  showText?: boolean;
  text?: string;
  subText?: string;
  className?: string;
  textClassName?: string;
}

export function LoadingAnimation({
  size = "medium",
  showText = false,
  text = "Loading...",
  subText,
  className,
  textClassName,
}: LoadingAnimationProps) {
  const sizeClasses = {
    small: "h-5 w-5 border-2",
    medium: "h-8 w-8 border-2",
    large: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent border-otw-gold",
          sizeClasses[size],
        )}
      />

      {showText && (
        <div className={cn("mt-4 text-center", textClassName)}>
          <p className="text-otw-gold font-medium">{text}</p>
          {subText && <p className="text-sm text-gray-400 mt-1">{subText}</p>}
        </div>
      )}
    </div>
  );
}
