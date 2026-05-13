"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/utils/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageView(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
  }, [pathname, searchParams]);

  return null;
}
