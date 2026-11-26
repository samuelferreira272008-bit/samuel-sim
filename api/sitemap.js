export const config = {
  runtime: "edge",
};

const SUPABASE_URL = "https://eagqdnmzgoodmxfkqprd.supabase.co";
const SUPABASE_KEY = "sb_publishable_VAKy-L2r4tZeWEKiczfHlg_J999Ndo5";

const STATIC_ROUTES = [
  "/",
  "/sobre",
  "/apps",
  "/projetos",
  "/conteudos",
  "/produtos",
  "/ferramentas",
  "/lab",
  "/blog",
  "/empresas",
  "/comunidade",
  "/patrocinar",
  "/contacto",
  "/termos",
  "/privacidade",
];

const TYPE_PREFIX = {
  app: "/apps",
  project: "/projetos",
  content: "/conteudos",
  tool: "/ferramentas",
  lab: "/lab",
};

function esc(str = "") {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function fetchRows(table, query) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function handler(req) {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "samuel-sim.lovable.app";
  const origin = `${proto}://${host}`;
  const today = new Date().toISOString().split("T")[0];

  const [posts, products, contentItems, businesses] = await Promise.all([
    fetchRows("posts", "select=slug,updated_at,created_at&published=eq.true"),
    fetchRows("products", "select=id,updated_at,created_at&is_active=eq.true"),
    fetchRows("content_items", "select=id,type,updated_at,created_at&status=neq.archived"),
    fetchRows("businesses", "select=slug,updated_at&is_published=eq.true"),
  ]);

  const seen = new Set();
  const urls = [];

  const addUrl = (loc, lastmod) => {
    const full = `${origin}${loc}`;
    if (seen.has(full)) return;
    seen.add(full);
    urls.push(`  <url><loc>${esc(full)}</loc><lastmod>${lastmod || today}</lastmod></url>`);
  };

  for (const path of STATIC_ROUTES) addUrl(path, today);
  for (const p of posts) {
    if (p.slug) addUrl(`/blog/${p.slug}`, (p.updated_at || p.created_at || "").split("T")[0]);
  }
  for (const prod of products) {
    if (prod.id) addUrl(`/produtos/${prod.id}`, (prod.updated_at || prod.created_at || "").split("T")[0]);
  }
  for (const item of contentItems) {
    const prefix = TYPE_PREFIX[item.type];
    if (prefix && item.id) addUrl(`${prefix}/${item.id}`, (item.updated_at || item.created_at || "").split("T")[0]);
  }
  for (const biz of businesses) {
    if (biz.slug) addUrl(`/empresas/${biz.slug}`, (biz.updated_at || "").split("T")[0]);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
