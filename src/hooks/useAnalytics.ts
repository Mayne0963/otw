'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '../lib/services/analytics';
import { env } from '../lib/env';

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (env.ENABLE_ANALYTICS) {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      analytics.trackPageView(url);
    }
  }, [pathname, searchParams]);

  return analytics;
}
