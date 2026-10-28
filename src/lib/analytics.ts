import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "analytics_session_id";
const QUEUE_KEY = "analytics_queue";
const FLUSH_INTERVAL = 4000;
const MAX_BATCH = 20;

export type AnalyticsEventType =
  | "page_view"
  | "user_registered"
  | "login"
  | "logout"
  | "product_view"
  | "purchase_started"
  | "purchase_completed"
  | "payment_pending"
  | "payment_approved"
  | "payment_rejected"
  | "content_view"
  | "post_view"
  | "download"
  | "click_cta"
  | "newsletter_signup"
  | "search"
  | "custom";

interface QueuedEvent {
  user_id: string | null;
  session_id: string;
  event_type: string;
  page: string | null;
  metadata: Record<string, unknown>;
  user_agent: string | null;
  referrer: string | null;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function readQueue(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedEvent[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    // ignore quota errors
  }
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  flushTimer = null;
  const queue = readQueue();
  if (!queue.length) return;
  const batch = queue.slice(0, MAX_BATCH);
  const remaining = queue.slice(batch.length);
  writeQueue(remaining);

  const { error } = await supabase.from("analytics_events").insert(batch as never);
  if (error) {
    // Re-queue on failure (cap to 100 to avoid runaway growth)
    const requeued = [...batch, ...remaining].slice(-100);
    writeQueue(requeued);
    if (import.meta.env.DEV) console.warn("analytics flush failed", error.message);
  } else if (remaining.length) {
    scheduleFlush();
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL);
}

export async function trackEvent(
  event_type: AnalyticsEventType | string,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const { data: { user } } = await supabase.auth.getUser();

  const event: QueuedEvent = {
    user_id: user?.id ?? null,
    session_id: getSessionId(),
    event_type,
    page: window.location.pathname,
    metadata,
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
  };

  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);

  if (queue.length >= MAX_BATCH) {
    flush();
  } else {
    scheduleFlush();
  }
}

// Flush remaining events when the page is hidden/unloaded
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("beforeunload", () => flush());
}

export async function aggregateDailyMetrics(date?: string) {
  const { error } = await supabase.rpc("aggregate_daily_metrics", {
    _target_date: date ?? new Date().toISOString().slice(0, 10),
  } as never);
  if (error) throw error;
}
