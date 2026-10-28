import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TABLES = ["categories", "posts", "post_links", "post_resources", "products", "content_items"] as const;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function cleanText(value: unknown, fallback = "Backup interno") {
  return (typeof value === "string" ? value : fallback).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120) || fallback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Não autorizado" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) return json({ error: "Sessão inválida" }, 401);
    const userId = claimsData.claims.sub;

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Apenas administradores podem gerir backups" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "list") {
      const { data, error } = await admin.from("platform_backups").select("id,label,scope,status,created_at,restored_at").order("created_at", { ascending: false }).limit(50);
      if (error) return json({ error: error.message }, 400);
      return json({ backups: data ?? [] });
    }

    if (action === "create") {
      const payload: Record<string, unknown> = {};
      for (const table of TABLES) {
        const { data, error } = await admin.from(table).select("*").limit(1000);
        if (error) return json({ error: `Erro ao copiar ${table}: ${error.message}` }, 400);
        payload[table] = data ?? [];
      }
      const { data, error } = await admin.from("platform_backups").insert({
        created_by: userId,
        label: cleanText(body.label, `Backup ${new Date().toLocaleString("pt-PT")}`),
        scope: "content-commerce",
        status: "created",
        payload,
      }).select("id,label,created_at").single();
      if (error) return json({ error: error.message }, 400);
      return json({ backup: data });
    }

    if (action === "restore") {
      const backupId = cleanText(body.backupId, "");
      if (!backupId) return json({ error: "backupId obrigatório" }, 400);
      const { data: backup, error } = await admin.from("platform_backups").select("payload").eq("id", backupId).maybeSingle();
      if (error || !backup) return json({ error: error?.message ?? "Backup não encontrado" }, 404);
      const payload = backup.payload as Record<string, unknown[]>;
      for (const table of TABLES) {
        const rows = Array.isArray(payload?.[table]) ? payload[table] : [];
        if (rows.length > 0) {
          const { error: upsertError } = await admin.from(table).upsert(rows as never, { onConflict: "id" });
          if (upsertError) return json({ error: `Erro ao restaurar ${table}: ${upsertError.message}` }, 400);
        }
      }
      await admin.from("platform_backups").update({ status: "restored", restored_at: new Date().toISOString() }).eq("id", backupId);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (e) {
    console.error("platform-backup error", e);
    return json({ error: e instanceof Error ? e.message : "Erro inesperado" }, 500);
  }
});
