import { supabase } from "@/integrations/supabase/client";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "payment" | "content" | "system" | string;
  link: string | null;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

const db = supabase as any;

export async function getNotifications(limit = 20) {
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as NotificationItem[];
}

export async function markNotificationRead(id: string) {
  const { error } = await db.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await db.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  if (error) throw error;
}

export async function createAdminNotification(input: { user_id: string; title: string; message: string; type?: string; link?: string }) {
  const { error } = await db.from("notifications").insert({
    user_id: input.user_id,
    title: input.title,
    message: input.message,
    type: input.type ?? "system",
    link: input.link ?? null,
  });
  if (error) throw error;
}
