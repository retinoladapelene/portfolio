"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/utils/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    trackPageView(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
  }, [pathname, searchParams]);

  // Track clicks globally
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button');
      
      if (clickable) {
        let name = clickable.getAttribute('aria-label') || clickable.getAttribute('title') || clickable.textContent || 'unknown';
        name = name.slice(0, 50).trim().replace(/\n/g, ' '); // Clean up the name
        
        // Don't track empty clicks or admin clicks to avoid clutter
        if (name && !pathname.startsWith('/admin')) {
          import('@/utils/analytics').then(({ trackEvent }) => {
            trackEvent({
              eventType: 'click',
              eventName: name,
              pagePath: pathname
            });
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
