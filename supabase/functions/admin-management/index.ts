import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const BodySchema = z.object({
  action: z.enum(["list_users", "set_user_role", "set_user_status", "broadcast_notification"]),
  payload: z.record(z.unknown()).default({}),
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function assertAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) throw new Error("Authentication required");

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) throw new Error("Invalid session");

  const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleError || !isAdmin) throw new Error("Admin access required");

  return { user: userData.user, userClient, adminClient };
}

async function audit(adminClient: ReturnType<typeof createClient>, actorId: string, action: string, targetType?: string, targetId?: string, metadata: Record<string, unknown> = {}) {
  await adminClient.rpc("admin_audit_log", {
    _actor_id: actorId,
    _action: action,
    _target_type: targetType ?? null,
    _target_id: targetId ?? null,
    _metadata: metadata,
    _severity: "info",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);

    const { user, userClient, adminClient } = await assertAdmin(req);
    const { action, payload } = parsed.data;

    if (action === "list_users") {
      const search = String(payload.search ?? "").toLowerCase().trim();
      const [{ data: authUsers, error: usersError }, profilesRes, rolesRes, purchasesRes, eventsRes] = await Promise.all([
        adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        adminClient.from("profiles").select("user_id, display_name, avatar_url, phone, status, last_seen_at"),
        adminClient.from("user_roles").select("user_id, role"),
        adminClient.from("purchases").select("user_id, amount, status"),
        adminClient.from("analytics_events").select("user_id"),
      ]);
      if (usersError) throw usersError;

      const profileMap = new Map((profilesRes.data ?? []).map((p: any) => [p.user_id, p]));
      const roleMap = new Map((rolesRes.data ?? []).map((r: any) => [r.user_id, r.role]));
      const purchaseMap = new Map<string, { purchases_count: number; total_spent: number }>();
      (purchasesRes.data ?? []).forEach((purchase: any) => {
        const current = purchaseMap.get(purchase.user_id) ?? { purchases_count: 0, total_spent: 0 };
        current.purchases_count += 1;
        if (purchase.status === "completed" || purchase.status === "approved") current.total_spent += Number(purchase.amount ?? 0);
        purchaseMap.set(purchase.user_id, current);
      });
      const activityMap = new Map<string, number>();
      (eventsRes.data ?? []).forEach((event: any) => {
        if (event.user_id) activityMap.set(event.user_id, (activityMap.get(event.user_id) ?? 0) + 1);
      });

      const users = authUsers.users
        .map((authUser) => {
          const profile = profileMap.get(authUser.id) ?? null;
          const purchaseStats = purchaseMap.get(authUser.id) ?? { purchases_count: 0, total_spent: 0 };
          return {
            id: authUser.id,
            email: authUser.email ?? "",
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at ?? null,
            role: roleMap.get(authUser.id) ?? "user",
            profile,
            purchases_count: purchaseStats.purchases_count,
            total_spent: purchaseStats.total_spent,
            activity_count: activityMap.get(authUser.id) ?? 0,
          };
        })
        .filter((entry) => {
          if (!search) return true;
          return entry.email.toLowerCase().includes(search) || (entry.profile?.display_name ?? "").toLowerCase().includes(search);
        });

      return json({ users });
    }

    if (action === "set_user_role") {
      const schema = z.object({ user_id: z.string().uuid(), role: z.enum(["admin", "user"]) });
      const input = schema.parse(payload);
      const { error } = await userClient.rpc("set_user_role", { _target_user_id: input.user_id, _role: input.role });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "set_user_status") {
      const schema = z.object({ user_id: z.string().uuid(), status: z.enum(["active", "deactivated", "banned"]) });
      const input = schema.parse(payload);
      const { error } = await userClient.rpc("set_user_status", { _target_user_id: input.user_id, _status: input.status });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "broadcast_notification") {
      const schema = z.object({
        title: z.string().trim().min(1).max(120),
        message: z.string().trim().min(1).max(1200),
        type: z.string().trim().max(40).default("system"),
        link: z.string().trim().max(500).optional().nullable(),
      });
      const input = schema.parse(payload);
      const { data: profiles, error: profilesError } = await adminClient.from("profiles").select("user_id").eq("status", "active");
      if (profilesError) throw profilesError;
      const rows = (profiles ?? []).map((profile: any) => ({
        user_id: profile.user_id,
        title: input.title,
        message: input.message,
        type: input.type,
        link: input.link ?? null,
        metadata: { broadcast: true, sent_by: user.id },
      }));
      if (rows.length > 0) {
        const { error } = await adminClient.from("notifications").insert(rows);
        if (error) throw error;
      }
      await audit(adminClient, user.id, "notification_broadcast", "notifications", null, { count: rows.length, title: input.title });
      return json({ ok: true, count: rows.length });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ error: message }, message.includes("required") ? 403 : 500);
  }
});
