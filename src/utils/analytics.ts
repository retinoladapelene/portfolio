"use client";

export type AnalyticsEvent = {
  eventType: 'view' | 'click' | 'submit';
  pagePath?: string;
  eventName?: string;
  metadata?: Record<string, any>;
};

export const trackEvent = async (event: AnalyticsEvent) => {
  try {
    // Only track in production or if explicitly enabled
    // For now, let's track everything to see data
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        pagePath: event.pagePath || window.location.pathname,
        metadata: {
          ...event.metadata,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          referrer: document.referrer
        }
      }),
    });
  } catch (err) {
    console.error('Failed to track event:', err);
  }
};

export const trackPageView = (path?: string) => {
  trackEvent({ eventType: 'view', pagePath: path });
};
