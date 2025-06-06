import { Analytics } from '@vercel/analytics/react';
import { init, track } from '@amplitude/analytics-browser';

// Initialize analytics
if (typeof window !== 'undefined') {
  init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '');
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  track(eventName, properties);
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
