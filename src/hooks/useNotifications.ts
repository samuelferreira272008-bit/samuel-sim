import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getNotifications, markAllNotificationsRead, markNotificationRead, type NotificationItem } from "@/lib/notifications";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      setNotifications(await getNotifications());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`notifications-${user.id}-${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, user]);

  const markRead = async (id: string) => {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
    await markNotificationRead(id);
  };

  const markAllRead = async () => {
    if (!user) return;
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    await markAllNotificationsRead(user.id);
  };

  return { notifications, unreadCount, loading, reload: load, markRead, markAllRead };
}
