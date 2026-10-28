import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: "admin" | "user" | string;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    status: "active" | "deactivated" | "banned" | string;
    last_seen_at: string | null;
  } | null;
  purchases_count: number;
  total_spent: number;
  activity_count: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  payments: { pending: number; approved: number; rejected: number };
};

export async function adminAction<T = unknown>(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("admin-management", {
    body: { action, payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function listAdminUsers(search = ""): Promise<AdminUser[]> {
  try {
    const data = await adminAction<{ users: AdminUser[] }>("list_users", { search });
    if (Array.isArray(data?.users)) return data.users;
  } catch {
    // Fallback to direct query using admin RLS permissions
  }

  const [{ data: profiles }, { data: roles }, { data: purchases }] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }),
    db.from("user_roles").select("user_id, role"),
    db.from("purchases").select("user_id, amount, status"),
  ]);

  const roleMap = new Map<string, string>();
  (roles ?? []).forEach((r: any) => roleMap.set(r.user_id, r.role));

  const purchaseMap = new Map<string, { count: number; spent: number }>();
  (purchases ?? []).forEach((p: any) => {
    const cur = purchaseMap.get(p.user_id) ?? { count: 0, spent: 0 };
    cur.count += 1;
    if (p.status === "completed" || p.status === "approved") {
      cur.spent += Number(p.amount ?? 0);
    }
    purchaseMap.set(p.user_id, cur);
  });

  const q = search.trim().toLowerCase();
  return (profiles ?? [])
    .map((prof: any): AdminUser => {
      const pStats = purchaseMap.get(prof.user_id) ?? { count: 0, spent: 0 };
      return {
        id: prof.user_id,
        email: prof.email ?? prof.display_name ?? prof.user_id,
        created_at: prof.created_at,
        last_sign_in_at: prof.last_seen_at ?? null,
        role: roleMap.get(prof.user_id) ?? "user",
        profile: {
          display_name: prof.display_name ?? null,
          avatar_url: prof.avatar_url ?? null,
          phone: prof.phone ?? null,
          status: prof.status ?? "active",
          last_seen_at: prof.last_seen_at ?? null,
        },
        purchases_count: pStats.count,
        total_spent: pStats.spent,
        activity_count: 0,
      };
    })
    .filter((u: AdminUser) =>
      !q
        ? true
        : (u.profile?.display_name ?? "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
    );
}

export async function setAdminUserRole(userId: string, role: "admin" | "user") {
  try {
    return await adminAction("set_user_role", { user_id: userId, role });
  } catch {
    const { data: existing } = await db.from("user_roles").select("id").eq("user_id", userId).maybeSingle();
    if (existing?.id) {
      const { error } = await db.from("user_roles").update({ role }).eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await db.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    }
    return { ok: true };
  }
}

export async function setAdminUserStatus(userId: string, status: "active" | "deactivated" | "banned") {
  try {
    return await adminAction("set_user_status", { user_id: userId, status });
  } catch {
    const { error } = await db.from("profiles").update({ status }).eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  }
}

export async function broadcastNotification(input: { title: string; message: string; type?: string; link?: string }) {
  try {
    return await adminAction("broadcast_notification", input);
  } catch {
    const { data: profiles, error: profError } = await db
      .from("profiles")
      .select("user_id")
      .eq("status", "active");
    if (profError) throw profError;
    const rows = (profiles ?? []).map((p: any) => ({
      user_id: p.user_id,
      title: input.title,
      message: input.message,
      type: input.type ?? "system",
      link: input.link ?? null,
    }));
    if (rows.length > 0) {
      const { error } = await db.from("notifications").insert(rows);
      if (error) throw error;
    }
    return { count: rows.length };
  }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [{ data: profiles }, { data: purchases }] = await Promise.all([
    db.from("profiles").select("status"),
    db.from("purchases").select("amount,status"),
  ]);

  const paymentStats = { pending: 0, approved: 0, rejected: 0 };
  let revenue = 0;

  (purchases ?? []).forEach((purchase: any) => {
    if (purchase.status === "completed" || purchase.status === "approved") {
      paymentStats.approved += 1;
      revenue += Number(purchase.amount ?? 0);
    } else if (purchase.status === "pending") {
      paymentStats.pending += 1;
    } else if (purchase.status === "rejected") {
      paymentStats.rejected += 1;
    }
  });

  return {
    totalUsers: profiles?.length ?? 0,
    activeUsers: (profiles ?? []).filter((profile: any) => (profile.status ?? "active") === "active").length,
    revenue,
    payments: paymentStats,
  };
}

export async function auditLog(action: string, targetType?: string, targetId?: string, metadata: Record<string, unknown> = {}) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await db.rpc("admin_audit_log", {
    _actor_id: userData.user?.id ?? null,
    _action: action,
    _target_type: targetType ?? null,
    _target_id: targetId ?? null,
    _metadata: metadata,
    _severity: "info",
  });
  if (error) throw error;
}
