// Internal automation event dispatcher.
// Receives events, runs handlers (email, db updates, logs, whatsapp stub),
// and persists every execution to system_logs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type EventType =
  | "user_registered"
  | "payment_approved"
  | "payment_pending"
  | "payment_rejected"
  | "new_post_published"
  | "newsletter_subscribed";

interface EventPayload {
  event_type: EventType;
  payload: Record<string, unknown>;
  log_id?: string; // when called from a queued log row
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY"); // optional
const EMAIL_FROM =
  Deno.env.get("EMAIL_FROM") ?? "Samuel Simão <onboarding@resend.dev>";
const SITE_URL =
  Deno.env.get("SITE_URL") ?? "https://samuel-sim.lovable.app";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// ---------- Email service ----------
async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; provider: string; detail?: string }> {
  if (!RESEND_API_KEY) {
    // Provider not yet configured: succeed but mark as "skipped"
    return { ok: true, provider: "none", detail: "RESEND_API_KEY not set" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  const text = await res.text();
  return { ok: res.ok, provider: "resend", detail: text };
}

// ---------- HTML templates ----------
const baseLayout = (title: string, body: string) => `
<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#f6f6f7;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #eee">
    <h1 style="margin:0 0 16px;font-size:20px;color:#111">${title}</h1>
    <div style="color:#333;line-height:1.6;font-size:15px">${body}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
    <p style="color:#888;font-size:12px;margin:0">Samuel Simão · <a href="${SITE_URL}" style="color:#888">${SITE_URL}</a></p>
  </div>
</body></html>`;

const tpl = {
  welcome: (name: string) =>
    baseLayout(
      `Bem-vindo, ${name}!`,
      `<p>Obrigado por te juntares à plataforma. Já podes aceder ao teu <a href="${SITE_URL}/dashboard">dashboard</a> e explorar conteúdos, projetos e a comunidade.</p>`,
    ),
  paymentApproved: (name: string, product: string, amount: number) =>
    baseLayout(
      `Pagamento aprovado ✅`,
      `<p>Olá ${name}, o teu pagamento de <strong>${amount} AOA</strong> para <strong>${product}</strong> foi aprovado. O acesso já está disponível em <a href="${SITE_URL}/compras">As minhas compras</a>.</p>`,
    ),
  paymentPending: (name: string, product: string) =>
    baseLayout(
      `Pagamento em análise ⏳`,
      `<p>Olá ${name}, recebemos o teu comprovativo para <strong>${product}</strong> e está em análise. Recebes nova notificação assim que for validado.</p>`,
    ),
  paymentRejected: (name: string, product: string, reason?: string) =>
    baseLayout(
      `Pagamento rejeitado ❌`,
      `<p>Olá ${name}, infelizmente o pagamento para <strong>${product}</strong> não pôde ser validado.${
        reason ? ` Motivo: ${reason}.` : ""
      } Por favor verifica os detalhes em <a href="${SITE_URL}/compras">As minhas compras</a> ou contacta-nos.</p>`,
    ),
  newPost: (title: string, slug: string, excerpt: string | null) =>
    baseLayout(
      `Novo conteúdo: ${title}`,
      `<p>${excerpt ?? "Há novo conteúdo no blog."}</p><p><a href="${SITE_URL}/blog/${slug}" style="display:inline-block;background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Ler agora</a></p>`,
    ),
  newsletterWelcome: (name: string | null) =>
    baseLayout(
      `Subscrição confirmada`,
      `<p>${name ? `Olá ${name},` : "Olá,"} obrigado por subscreveres a newsletter. Vais receber novidades sobre conteúdos, projetos e oportunidades.</p>`,
    ),
};

// ---------- WhatsApp (future-ready stub) ----------
async function sendWhatsApp(phone: string, message: string) {
  // Intentionally not integrated. Logged for future migration.
  console.log("[whatsapp:stub]", phone, message.slice(0, 80));
  return { ok: true, provider: "stub" };
}

// ---------- Helpers ----------
async function getUserEmail(
  user_id: string,
): Promise<{ email: string | null; name: string | null; phone: string | null; notify_payments: boolean }> {
  const { data: authUser } = await admin.auth.admin.getUserById(user_id);
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, phone, notify_payments")
    .eq("user_id", user_id)
    .maybeSingle();
  return {
    email: authUser?.user?.email ?? null,
    name: profile?.display_name ?? authUser?.user?.email ?? null,
    phone: profile?.phone ?? null,
    notify_payments: profile?.notify_payments ?? true,
  };
}

// ---------- Handlers ----------
async function handleUserRegistered(p: any) {
  const email = p.email as string;
  const name = (p.display_name as string) ?? email;
  if (!email) return { skipped: "no email" };
  const r = await sendEmail({
    to: email,
    subject: "Bem-vindo à plataforma 👋",
    html: tpl.welcome(name),
  });
  return { email: r };
}

async function handlePayment(
  kind: "approved" | "pending" | "rejected",
  p: any,
) {
  const u = await getUserEmail(p.user_id);
  if (!u.email || !u.notify_payments) return { skipped: true };
  const product = (p.product_name as string) ?? "Produto";
  const subject =
    kind === "approved"
      ? "Pagamento aprovado ✅"
      : kind === "pending"
        ? "Pagamento em análise ⏳"
        : "Pagamento rejeitado ❌";
  const html =
    kind === "approved"
      ? tpl.paymentApproved(u.name ?? "", product, Number(p.amount ?? 0))
      : kind === "pending"
        ? tpl.paymentPending(u.name ?? "", product)
        : tpl.paymentRejected(u.name ?? "", product, p.reason);
  const r = await sendEmail({ to: u.email, subject, html });
  return { email: r };
}

async function handleNewPost(p: any) {
  // Fan-out: union of newsletter subscribers + opted-in users
  const { data: subs } = await admin
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null)
    .eq("confirmed", true);

  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id")
    .eq("notify_new_posts", true);

  const userIds = (profiles ?? []).map((r) => r.user_id);
  const userEmails: string[] = [];
  for (const id of userIds) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data?.user?.email) userEmails.push(data.user.email);
  }

  const all = new Set<string>([
    ...(subs ?? []).map((s) => s.email),
    ...userEmails,
  ]);
  if (all.size === 0) return { skipped: "no recipients" };

  const subject = `📰 ${p.title}`;
  const html = tpl.newPost(p.title, p.slug, p.excerpt ?? null);

  // Send in small batches
  const list = [...all];
  let sent = 0;
  for (const to of list) {
    const r = await sendEmail({ to, subject, html });
    if (r.ok) sent++;
  }
  return { recipients: list.length, sent };
}

async function handleNewsletterSubscribed(p: any) {
  if (!p.email) return { skipped: "no email" };
  const r = await sendEmail({
    to: p.email,
    subject: "Subscrição confirmada",
    html: tpl.newsletterWelcome(p.name ?? null),
  });
  return { email: r };
}

async function runHandler(event_type: string, payload: any) {
  switch (event_type) {
    case "user_registered":
      return handleUserRegistered(payload);
    case "payment_approved":
      return handlePayment("approved", payload);
    case "payment_pending":
      return handlePayment("pending", payload);
    case "payment_rejected":
      return handlePayment("rejected", payload);
    case "new_post_published":
      return handleNewPost(payload);
    case "newsletter_subscribed":
      return handleNewsletterSubscribed(payload);
    default:
      return { skipped: `unknown event ${event_type}` };
  }
}

// ---------- HTTP entrypoint ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Partial<EventPayload>;
    if (!body.event_type) {
      return new Response(
        JSON.stringify({ error: "event_type required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = body.payload ?? {};

    // Insert log row in 'processing' state (or update existing queued one)
    let logId = body.log_id ?? null;
    if (logId) {
      await admin
        .from("system_logs")
        .update({ status: "processing" })
        .eq("id", logId);
    } else {
      const { data } = await admin
        .from("system_logs")
        .insert({
          event_type: body.event_type,
          payload,
          status: "processing",
        })
        .select("id")
        .single();
      logId = data?.id ?? null;
    }

    let result: any;
    let error: string | null = null;
    try {
      result = await runHandler(body.event_type, payload);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    if (logId) {
      await admin
        .from("system_logs")
        .update({
          status: error ? "failed" : "success",
          error_message: error,
          payload: { ...payload, _result: result ?? null },
        })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({ ok: !error, result, error }),
      {
        status: error ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
