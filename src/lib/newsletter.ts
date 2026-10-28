// Newsletter subscription helpers.
import { supabase } from "@/integrations/supabase/client";
import { dispatchEvent } from "@/lib/events";

export async function subscribeToNewsletter(args: {
  email: string;
  name?: string;
  user_id?: string;
}) {
  const email = args.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Email inválido" };
  }
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email,
        name: args.name ?? null,
        user_id: args.user_id ?? null,
        unsubscribed_at: null,
        confirmed: true,
      },
      { onConflict: "email" },
    );
  if (error) return { ok: false, error: error.message };

  // Fire-and-forget welcome email (handler logs result to system_logs)
  await dispatchEvent("newsletter_subscribed", {
    email,
    name: args.name ?? null,
  });

  return { ok: true };
}

export async function unsubscribeFromNewsletter(email: string) {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("email", email.trim().toLowerCase());
  return { ok: !error, error: error?.message };
}
