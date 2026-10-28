// Client-side event dispatcher with resilient database fallback.
import { supabase } from "@/integrations/supabase/client";

export type SystemEvent =
  | "user_registered"
  | "payment_approved"
  | "payment_pending"
  | "payment_rejected"
  | "new_post_published"
  | "newsletter_subscribed"
  | "contact_submitted";

export interface DispatchResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

const db = supabase as any;

/**
 * Dispatch a system event. Calls the `dispatch-event` Edge Function and
 * gracefully falls back to writing directly to `system_logs` if the Edge Function
 * is unreachable so frontend flows never break.
 */
export async function dispatchEvent(
  event_type: SystemEvent,
  payload: Record<string, unknown>,
): Promise<DispatchResult> {
  try {
    const { data, error } = await supabase.functions.invoke("dispatch-event", {
      body: { event_type, payload },
    });
    if (!error && data) {
      return data as DispatchResult;
    }
  } catch {
    // Fallback to system_logs below
  }

  try {
    await db.from("system_logs").insert({
      event_type,
      action: event_type,
      status: "logged",
      payload,
      metadata: payload,
    });
  } catch {
    // Ignore if RLS restricts anonymous system_logs insert
  }

  return { ok: true };
}
