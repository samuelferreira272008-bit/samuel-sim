export const config = {
  runtime: "edge",
};

const SUPABASE_URL = "https://eagqdnmzgoodmxfkqprd.supabase.co";
const SUPABASE_KEY = "sb_publishable_VAKy-L2r4tZeWEKiczfHlg_J999Ndo5";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f532055f-7af3-4c07-a111-be059db63d48/id-preview-f856f29e--1c48bd6f-9db4-4b93-9251-f34489991c6d.lovable.app-1775861842621.png";
const DEFAULT_DESCRIPTION =
  "Plataforma oficial de Samuel Simão: aplicações web, projetos de robótica e software, ferramentas, produtos digitais e artigos práticos sobre tecnologia.";

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clamp(text = "", max = 160) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

async function queryOne(table, params) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}&limit=1`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}

async function resolveMetadata(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";

  if (clean.startsWith("/blog/")) {
    const slug = decodeURIComponent(clean.slice("/blog/".length));
    const post = await queryOne(
      "posts",
      `select=title,slug,excerpt,cover_image,created_at,seo_title,seo_description&slug=eq.${encodeURIComponent(slug)}&published=eq.true`,
    );
    if (post) {
      return {
        title: `${post.seo_title || post.title} — Samuel Simão`,
        description: post.seo_description || post.excerpt || DEFAULT_DESCRIPTION,
        image: post.cover_image || DEFAULT_IMAGE,
        type: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: clamp(post.seo_description || post.excerpt || post.title, 160),
          image: [post.cover_image || DEFAULT_IMAGE],
          datePublished: post.created_at,
          author: { "@type": "Person", name: "Samuel Simão" },
        },
      };
    }
  }

  if (clean.startsWith("/produtos/")) {
    const id = decodeURIComponent(clean.slice("/produtos/".length));
    const prod = await queryOne(
      "products",
      `select=id,name,description,price,currency,image_url&id=eq.${encodeURIComponent(id)}&is_active=eq.true`,
    );
    if (prod) {
      return {
        title: `${prod.name} — Samuel Simão`,
        description: prod.description || DEFAULT_DESCRIPTION,
        image: prod.image_url || DEFAULT_IMAGE,
        type: "product",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: prod.name,
          description: clamp(prod.description || prod.name, 160),
          image: [prod.image_url || DEFAULT_IMAGE],
          offers: {
            "@type": "Offer",
            price: String(prod.price ?? 0),
            priceCurrency: prod.currency || "AOA",
            availability: "https://schema.org/InStock",
          },
        },
      };
    }
  }

  const repoMatch = clean.match(/^\/(apps|projetos|conteudos|ferramentas|lab)\/([^/]+)$/);
  if (repoMatch) {
    const id = decodeURIComponent(repoMatch[2]);
    const item = await queryOne(
      "content_items",
      `select=id,type,title,description,thumbnail_url&id=eq.${encodeURIComponent(id)}&status=neq.archived`,
    );
    if (item) {
      return {
        title: `${item.title} — Samuel Simão`,
        description: item.description || DEFAULT_DESCRIPTION,
        image: item.thumbnail_url || DEFAULT_IMAGE,
        type: item.type === "project" || item.type === "content" ? "article" : "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": item.type === "app" ? "SoftwareApplication" : "CreativeWork",
          name: item.title,
          description: clamp(item.description || item.title, 160),
          image: item.thumbnail_url || DEFAULT_IMAGE,
        },
      };
    }
  }

  if (clean.startsWith("/empresas/")) {
    const slug = decodeURIComponent(clean.slice("/empresas/".length));
    const biz = await queryOne(
      "businesses",
      `select=name,tagline,description,logo_url&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true`,
    );
    if (biz) {
      return {
        title: `${biz.name} — Samuel Simão`,
        description: biz.description || biz.tagline || DEFAULT_DESCRIPTION,
        image: biz.logo_url || DEFAULT_IMAGE,
        type: "website",
      };
    }
  }

  return null;
}

export default async function handler(req) {
  const reqUrl = new URL(req.url);
  const rawPath = reqUrl.searchParams.get("path") || "/";
  const targetPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "samuel-sim.lovable.app";
  const origin = `${proto}://${host}`;
  const canonical = `${origin}${targetPath}`;

  const [meta, baseRes] = await Promise.all([
    resolveMetadata(targetPath),
    fetch(`${origin}/index.html`),
  ]);

  let html = baseRes.ok
    ? await baseRes.text()
    : `<!doctype html><html lang="pt"><head><meta charset="UTF-8" /><title>Samuel Simão</title><meta name="description" content="${esc(DEFAULT_DESCRIPTION)}" /></head><body><div id="root"></div></body></html>`;

  if (meta) {
    const title = clamp(meta.title, 60);
    const desc = clamp(meta.description, 160);
    const img = meta.image || DEFAULT_IMAGE;
    const ogType = meta.type || "website";

    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${esc(desc)}" />`)
      .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${esc(canonical)}" />`)
      .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${esc(ogType)}" />`)
      .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${esc(canonical)}" />`)
      .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${esc(title)}" />`)
      .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${esc(desc)}" />`)
      .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${esc(img)}" />`)
      .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${esc(title)}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${esc(desc)}" />`)
      .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${esc(img)}" />`);

    if (meta.jsonLd) {
      html = html.replace(
        /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`,
      );
    }
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
