import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const CURATED_TS_PATH = path.join(ROOT_DIR, "src", "lib", "curatedContent.ts");

const SITE_URL = (process.env.SITE_URL || "https://samuel-sim.lovable.app").replace(/\/+$/, "");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://eagqdnmzgoodmxfkqprd.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_VAKy-L2r4tZeWEKiczfHlg_J999Ndo5";

const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f532055f-7af3-4c07-a111-be059db63d48/id-preview-f856f29e--1c48bd6f-9db4-4b93-9251-f34489991c6d.lovable.app-1775861842621.png";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clamp(str = "", max = 160) {
  const clean = String(str).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

async function loadCuratedData() {
  try {
    const { transformSync } = await import("esbuild");
    const tsCode = fs.readFileSync(CURATED_TS_PATH, "utf8");
    const { code } = transformSync(tsCode, {
      loader: "ts",
      format: "esm",
    });
    const tmpFile = path.join(DIST_DIR, ".curated-tmp.mjs");
    fs.writeFileSync(tmpFile, code, "utf8");
    const mod = await import(`${pathToFileURL(tmpFile).href}?t=${Date.now()}`);
    fs.unlinkSync(tmpFile);
    return {
      posts: mod.CURATED_POSTS || [],
      projects: mod.CURATED_PROJECTS || [],
      labItems: mod.CURATED_LAB_ITEMS || [],
      products: mod.CURATED_PRODUCTS || [],
    };
  } catch (err) {
    console.warn("[prerender-seo] Could not load curatedContent.ts via esbuild:", err.message);
    return { posts: [], projects: [], labItems: [], products: [] };
  }
}

async function fetchSupabaseRows(table, query) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function buildPageHtml(template, routeMeta) {
  const title = clamp(routeMeta.title, 60);
  const description = clamp(routeMeta.description, 160);
  const canonical = `${SITE_URL}${routeMeta.route === "/" ? "/" : routeMeta.route}`;
  const image = routeMeta.image || DEFAULT_IMAGE;
  const ogType = routeMeta.type || "website";
  const jsonLd = routeMeta.jsonLd || {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
  };

  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  );
  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  );

  // Inject lightweight semantic fallback inside #root for instant bot/crawler readability
  // React 18 createRoot().render() cleanly replaces #root children when mounted.
  const heading = escapeHtml(routeMeta.heading || title);
  const summary = escapeHtml(description);
  const bodySnippet = routeMeta.snippet
    ? `<p>${escapeHtml(clamp(routeMeta.snippet, 320))}</p>`
    : "";

  const semanticRoot = `<div id="root"><main style="max-width:760px;margin:48px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#111"><header><p style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#666">Samuel Simão</p><h1 style="font-size:28px;margin:8px 0">${heading}</h1></header><p style="font-size:16px;line-height:1.6;color:#444">${summary}</p>${bodySnippet}<nav aria-label="Navegação principal" style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;font-size:14px"><a href="/">Início</a><a href="/sobre">Sobre</a><a href="/apps">Apps</a><a href="/projetos">Projetos</a><a href="/produtos">Produtos</a><a href="/blog">Blog</a><a href="/contacto">Contacto</a></nav></main></div>`;

  html = html.replace(/<div\s+id="root"><\/div>/i, semanticRoot);
  return html;
}

function writeRouteHtml(routePath, html) {
  if (routePath === "/") {
    fs.writeFileSync(TEMPLATE_PATH, html, "utf8");
    return;
  }
  const cleanRel = routePath.replace(/^\/+/, "");
  const outDir = path.join(DIST_DIR, cleanRel);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
}

async function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error("[prerender-seo] dist/index.html not found. Run vite build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const curated = await loadCuratedData();

  const [dbPosts, dbProducts, dbContentItems, dbBusinesses] = await Promise.all([
    fetchSupabaseRows("posts", "select=id,slug,title,excerpt,cover_image,created_at,updated_at,seo_title,seo_description&published=eq.true"),
    fetchSupabaseRows("products", "select=id,name,description,price,currency,image_url,created_at,updated_at&is_active=eq.true"),
    fetchSupabaseRows("content_items", "select=id,type,title,description,thumbnail_url,created_at,updated_at&status=neq.archived"),
    fetchSupabaseRows("businesses", "select=id,slug,name,tagline,description,logo_url,updated_at&is_published=eq.true"),
  ]);

  const staticRoutes = [
    {
      route: "/",
      title: "Samuel Simão — Tecnologia, Software & Automação",
      heading: "Samuel Simão",
      description:
        "Criador de tecnologia, software e ferramentas digitais em Luanda, Angola. Aplicações web, robótica prática e artigos objetivos.",
      changefreq: "daily",
      priority: "1.0",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Samuel Simão",
        url: `${SITE_URL}/`,
        jobTitle: "Criador Digital, Developer e Empreendedor",
        description:
          "Plataforma oficial de Samuel Simão para aplicações, projetos de tecnologia, produtos digitais e blog.",
      },
    },
    {
      route: "/sobre",
      title: "Sobre — Samuel Simão",
      heading: "Sobre Samuel Simão",
      description:
        "Conheça o meu percurso em Eletrónica, Telecomunicações e Engenharia de Software, os meus princípios e os projetos que construo.",
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      route: "/apps",
      title: "Apps & Programas — Samuel Simão",
      heading: "Apps & Programas",
      description:
        "Aplicações web e softwares construídos por Samuel Simão prontos para executar diretamente no navegador ou transferir.",
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      route: "/projetos",
      title: "Projetos & Engenharia — Samuel Simão",
      heading: "Projetos & Engenharia",
      description:
        "Portfólio de projetos de robótica, automação, hardware e plataformas web como o REPI Rover, Pafiworky e Samuka Play.",
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      route: "/conteudos",
      title: "Conteúdos — Samuel Simão",
      heading: "Repositório de Conteúdos",
      description:
        "Artigos técnicos, guias práticos, materiais de estudo e recursos educativos publicados por Samuel Simão.",
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      route: "/produtos",
      title: "Produtos & Serviços — Samuel Simão",
      heading: "Produtos & Serviços Digitais",
      description:
        "Templates, guias práticos e consultoria técnica com pagamento rápido via Multicaixa Express, BAI Direto e PayPal.",
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      route: "/ferramentas",
      title: "Ferramentas Recomendadas — Samuel Simão",
      heading: "Ferramentas & Stack",
      description:
        "Coleção curada das ferramentas digitais, motores de IA e utilitários que utilizo diariamente para construir projetos.",
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      route: "/lab",
      title: "Lab Experimental — Samuel Simão",
      heading: "Laboratório de Ideias & Protótipos",
      description:
        "Experiências em curso, pipelines de automação com IA e protótipos interativos em fase de validação.",
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      route: "/blog",
      title: "Blog & Artigos — Samuel Simão",
      heading: "Blog de Tecnologia e Empreendedorismo",
      description:
        "Artigos práticos sobre tecnologia, inteligência artificial, funcionamento da Internet, engenharia e visão de negócio.",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      route: "/empresas",
      title: "Empresas & Marcas — Samuel Simão",
      heading: "Empresas & Iniciativas",
      description:
        "Negócios, produtos e organizações integradas sob o ecossistema Samuel Simão.",
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      route: "/comunidade",
      title: "Comunidade — Samuel Simão",
      heading: "Comunidade de Criadores e Tecnologia",
      description:
        "Espaço de conversa, partilha de aprendizagem e networking entre criadores e entusiastas de tecnologia.",
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      route: "/patrocinar",
      title: "Planos & Patrocínio — Samuel Simão",
      heading: "Planos, Membros & Patrocínio",
      description:
        "Apoia os projetos em público ou adquire acesso aos planos de acompanhamento e ferramentas exclusivas.",
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      route: "/contacto",
      title: "Contacto — Samuel Simão",
      heading: "Fala Comigo",
      description:
        "Envia uma mensagem direta, solicita orçamento de software ou entra em contacto via WhatsApp.",
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      route: "/termos",
      title: "Termos de Utilização — Samuel Simão",
      heading: "Termos de Utilização",
      description: "Termos e condições de uso da plataforma oficial de Samuel Simão.",
      changefreq: "monthly",
      priority: "0.3",
    },
    {
      route: "/privacidade",
      title: "Política de Privacidade — Samuel Simão",
      heading: "Política de Privacidade",
      description: "Política de privacidade e tratamento de dados na plataforma de Samuel Simão.",
      changefreq: "monthly",
      priority: "0.3",
    },
  ];

  const routeMap = new Map();
  for (const r of staticRoutes) {
    routeMap.set(r.route, r);
  }

  // Merge curated posts & DB posts
  const allPosts = [...curated.posts, ...dbPosts];
  for (const p of allPosts) {
    if (!p?.slug) continue;
    const route = `/blog/${p.slug}`;
    routeMap.set(route, {
      route,
      title: `${p.seo_title || p.title} — Samuel Simão`,
      heading: p.title,
      description: p.seo_description || p.excerpt || p.title,
      image: p.cover_image || p.coverImage || DEFAULT_IMAGE,
      type: "article",
      lastmod: (p.updated_at || p.created_at || p.createdAt || "").split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: p.title,
        description: clamp(p.seo_description || p.excerpt || p.title, 160),
        image: [p.cover_image || p.coverImage || DEFAULT_IMAGE],
        datePublished: p.created_at || p.createdAt || undefined,
        author: { "@type": "Person", name: p.authorName || "Samuel Simão" },
      },
    });
  }

  // Merge curated products & DB products
  const allProducts = [...curated.products, ...dbProducts];
  for (const prod of allProducts) {
    if (!prod?.id) continue;
    const route = `/produtos/${prod.id}`;
    routeMap.set(route, {
      route,
      title: `${prod.name} — Samuel Simão`,
      heading: prod.name,
      description: prod.description || `Adquire ${prod.name} com Multicaixa Express, BAI Direto ou PayPal.`,
      image: prod.image_url || DEFAULT_IMAGE,
      type: "product",
      lastmod: (prod.updated_at || prod.created_at || "").split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: prod.name,
        description: clamp(prod.description || prod.name, 160),
        image: prod.image_url ? [prod.image_url] : [DEFAULT_IMAGE],
        offers: {
          "@type": "Offer",
          price: String(prod.price ?? 0),
          priceCurrency: prod.currency || "AOA",
          availability: "https://schema.org/InStock",
        },
      },
    });
  }

  // Merge curated projects/lab & DB content_items
  const typeToPrefix = {
    app: "/apps",
    project: "/projetos",
    content: "/conteudos",
    tool: "/ferramentas",
    lab: "/lab",
  };
  const allContent = [...curated.projects, ...curated.labItems, ...dbContentItems];
  for (const item of allContent) {
    const prefix = typeToPrefix[item?.type];
    if (!prefix || !item?.id) continue;
    const route = `${prefix}/${item.id}`;
    routeMap.set(route, {
      route,
      title: `${item.title} — Samuel Simão`,
      heading: item.title,
      description: item.description || `${item.title} na plataforma Samuel Simão.`,
      image: item.thumbnail_url || DEFAULT_IMAGE,
      type: item.type === "project" || item.type === "content" ? "article" : "website",
      lastmod: (item.updated_at || item.created_at || "").split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": item.type === "app" ? "SoftwareApplication" : "CreativeWork",
        name: item.title,
        description: clamp(item.description || item.title, 160),
        image: item.thumbnail_url || DEFAULT_IMAGE,
      },
    });
  }

  // Merge DB businesses
  for (const biz of dbBusinesses) {
    if (!biz?.slug) continue;
    const route = `/empresas/${biz.slug}`;
    routeMap.set(route, {
      route,
      title: `${biz.name} — Samuel Simão`,
      heading: biz.name,
      description: biz.description || biz.tagline || `${biz.name} — Empresa do ecossistema Samuel Simão.`,
      image: biz.logo_url || DEFAULT_IMAGE,
      type: "website",
      lastmod: (biz.updated_at || "").split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const sitemapEntries = [];

  for (const meta of routeMap.values()) {
    const html = buildPageHtml(template, meta);
    writeRouteHtml(meta.route, html);
    sitemapEntries.push(
      `  <url><loc>${escapeHtml(`${SITE_URL}${meta.route === "/" ? "/" : meta.route}`)}</loc><lastmod>${meta.lastmod || today}</lastmod><changefreq>${meta.changefreq || "weekly"}</changefreq><priority>${meta.priority || "0.7"}</priority></url>`,
    );
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf8");
  fs.writeFileSync(path.join(ROOT_DIR, "public", "sitemap.xml"), sitemapXml, "utf8");

  console.log(
    `[prerender-seo] Pre-rendered ${routeMap.size} SEO routes and generated sitemap.xml (${sitemapEntries.length} URLs).`,
  );
}

main();
