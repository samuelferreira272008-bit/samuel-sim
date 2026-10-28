import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://samuelsimao.lovable.app";

const STATIC_ROUTES = [
  "", "/blog", "/sobre", "/projetos", "/ferramentas", "/lab",
  "/comunidade", "/patrocinar", "/comprar", "/contacto", "/search",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: posts } = await supabase
    .from("posts")
    .select("slug,updated_at")
    .eq("published", true);

  const { data: items } = await supabase
    .from("content_items")
    .select("id,type,updated_at");

  const today = new Date().toISOString().split("T")[0];

  const urls: string[] = [];

  for (const r of STATIC_ROUTES) {
    urls.push(`<url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`);
  }
  for (const p of posts ?? []) {
    const lm = (p.updated_at as string)?.split("T")[0] ?? today;
    urls.push(`<url><loc>${SITE_URL}/blog/${p.slug}</loc><lastmod>${lm}</lastmod></url>`);
  }
  for (const it of items ?? []) {
    if (it.type === "project") {
      urls.push(`<url><loc>${SITE_URL}/projetos</loc></url>`);
      break;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
