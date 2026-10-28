import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";

/**
 * Tracks page_view events on every route change.
 * Mount once near the app root (inside BrowserRouter).
 */
export function usePageViewTracking() {
  const location = useLocation();
  const lastPath = useRef<string>("");

  useEffect(() => {
    const path = location.pathname + location.search;
    if (path === lastPath.current) return;
    lastPath.current = path;
    trackEvent("page_view", { path });
  }, [location.pathname, location.search]);
}

/**
 * Imperative tracker for arbitrary events (clicks, conversions, etc.)
 */
export function useAnalytics() {
  return {
    track: (event: AnalyticsEventType | string, metadata?: Record<string, unknown>) =>
      trackEvent(event, metadata ?? {}),
  };
}
