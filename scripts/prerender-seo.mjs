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

function stripMarkdown(md = "") {
  return String(md)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>~#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function makeBreadcrumbsNode(breadcrumbs = []) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: b.name,
      item: `${SITE_URL}${b.path === "/" ? "/" : b.path}`,
    })),
  };
}

function buildPageHtml(template, routeMeta) {
  const title = clamp(routeMeta.title, 60);
  const description = clamp(routeMeta.description, 160);
  const canonical = `${SITE_URL}${routeMeta.route === "/" ? "/" : routeMeta.route}`;
  const image = routeMeta.image || DEFAULT_IMAGE;
  const ogType = routeMeta.type || "website";

  const breadcrumbs =
    routeMeta.breadcrumbs ||
    (routeMeta.route === "/"
      ? []
      : [
          { name: "Início", path: "/" },
          { name: routeMeta.heading || title, path: routeMeta.route },
        ]);

  const primaryNode = routeMeta.jsonLd || {
    "@type": routeMeta.schemaType || "WebPage",
    name: routeMeta.heading || title,
    description,
    url: canonical,
    inLanguage: "pt",
  };

  let finalJsonLd;
  if (primaryNode["@graph"]) {
    finalJsonLd = primaryNode;
  } else {
    const { "@context": _ignored, ...restNode } = primaryNode;
    const graph = [restNode];
    const bc = makeBreadcrumbsNode(breadcrumbs);
    if (bc) graph.push(bc);
    finalJsonLd = {
      "@context": "https://schema.org",
      "@graph": graph,
    };
  }

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
    `<script type="application/ld+json">${JSON.stringify(finalJsonLd)}</script>`,
  );

  // Lightweight semantic fallback inside #root for zero-JS crawlers and AI answer engines (GEO)
  const heading = escapeHtml(routeMeta.heading || title);
  const summary = escapeHtml(description);
  const bodySnippet = routeMeta.snippet
    ? `<p style="font-size:15px;line-height:1.7;color:#444;margin-top:12px">${escapeHtml(clamp(routeMeta.snippet, 750))}</p>`
    : "";
  const crumbsHtml =
    breadcrumbs.length > 0
      ? `<nav aria-label="Breadcrumb" style="font-size:13px;color:#666;margin-bottom:12px">${breadcrumbs
          .map((b) => `<a href="${escapeHtml(b.path)}">${escapeHtml(b.name)}</a>`)
          .join(" / ")}</nav>`
      : "";

  const semanticRoot = `<div id="root"><main style="max-width:760px;margin:48px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#111">${crumbsHtml}<article><header><p style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#666">Samuel Simão</p><h1 style="font-size:28px;margin:8px 0">${heading}</h1></header><p style="font-size:16px;line-height:1.6;color:#333">${summary}</p>${bodySnippet}</article><nav aria-label="Navegação principal" style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;font-size:14px"><a href="/">Início</a><a href="/sobre">Sobre</a><a href="/apps">Apps</a><a href="/projetos">Projetos</a><a href="/produtos">Produtos</a><a href="/blog">Blog</a><a href="/contacto">Contacto</a></nav></main></div>`;

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
    fetchSupabaseRows("posts", "select=id,slug,title,excerpt,content,cover_image,created_at,updated_at,seo_title,seo_description&published=eq.true"),
    fetchSupabaseRows("products", "select=id,name,description,price,currency,image_url,created_at,updated_at&is_active=eq.true"),
    fetchSupabaseRows("content_items", "select=id,type,title,description,body,thumbnail_url,platforms,version,price,created_at,updated_at&status=neq.archived"),
    fetchSupabaseRows("businesses", "select=id,slug,name,tagline,description,logo_url,website,updated_at&is_published=eq.true"),
  ]);

  const personNode = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Samuel Simão",
    url: `${SITE_URL}/`,
    jobTitle: "Criador de Tecnologia, Developer e Empreendedor Digital",
    homeLocation: { "@type": "Place", name: "Luanda, Angola" },
    knowsAbout: [
      "Engenharia de Software",
      "Eletrónica e Telecomunicações",
      "Robótica",
      "Automação",
      "Inteligência Artificial",
    ],
    description:
      "Plataforma oficial de Samuel Simão para aplicações, projetos de tecnologia, produtos digitais e blog.",
  };

  const staticRoutes = [
    {
      route: "/",
      title: "Samuel Simão — Tecnologia, Software & Automação",
      heading: "Samuel Simão",
      description:
        "Criador de tecnologia, software e ferramentas digitais em Luanda, Angola. Aplicações web, robótica prática e artigos objetivos.",
      snippet:
        "Samuel Simão é criador de tecnologia, engenheiro de software e empreendedor digital baseado em Luanda, Angola. Desenvolve aplicações web, projetos de robótica prática (REPI Rover), automação com IA (Pafiworky) e produtos digitais com checkout via Multicaixa Express, BAI Direto e PayPal.",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          personNode,
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Samuel Simão",
            url: `${SITE_URL}/`,
            inLanguage: "pt",
            publisher: { "@id": `${SITE_URL}/#person` },
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/blog?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ],
      },
    },
    {
      route: "/sobre",
      title: "Sobre — Samuel Simão",
      heading: "Sobre Samuel Simão",
      description:
        "Conheça o meu percurso em Eletrónica, Telecomunicações e Engenharia de Software, os meus princípios e os projetos que construo.",
      schemaType: "ProfilePage",
      jsonLd: {
        "@type": "ProfilePage",
        name: "Sobre Samuel Simão",
        url: `${SITE_URL}/sobre`,
        mainEntity: personNode,
      },
    },
    {
      route: "/apps",
      title: "Apps & Programas — Samuel Simão",
      heading: "Apps & Programas",
      description:
        "Aplicações web e softwares construídos por Samuel Simão prontos para executar diretamente no navegador ou transferir.",
    },
    {
      route: "/projetos",
      title: "Projetos & Engenharia — Samuel Simão",
      heading: "Projetos & Engenharia",
      description:
        "Portfólio de projetos de robótica, automação, hardware e plataformas web como o REPI Rover, Pafiworky e Samuka Play.",
    },
    {
      route: "/conteudos",
      title: "Conteúdos — Samuel Simão",
      heading: "Repositório de Conteúdos",
      description:
        "Artigos técnicos, guias práticos, materiais de estudo e recursos educativos publicados por Samuel Simão.",
    },
    {
      route: "/produtos",
      title: "Produtos & Serviços — Samuel Simão",
      heading: "Produtos & Serviços Digitais",
      description:
        "Templates, guias práticos e consultoria técnica com pagamento rápido via Multicaixa Express, BAI Direto e PayPal.",
    },
    {
      route: "/ferramentas",
      title: "Ferramentas Recomendadas — Samuel Simão",
      heading: "Ferramentas & Stack",
      description:
        "Coleção curada das ferramentas digitais, motores de IA e utilitários que utilizo diariamente para construir projetos.",
    },
    {
      route: "/lab",
      title: "Lab Experimental — Samuel Simão",
      heading: "Laboratório de Ideias & Protótipos",
      description:
        "Experiências em curso, pipelines de automação com IA e protótipos interativos em fase de validação.",
    },
    {
      route: "/blog",
      title: "Blog & Artigos — Samuel Simão",
      heading: "Blog de Tecnologia e Empreendedorismo",
      description:
        "Artigos práticos sobre tecnologia, inteligência artificial, funcionamento da Internet, engenharia e visão de negócio.",
    },
    {
      route: "/empresas",
      title: "Empresas & Marcas — Samuel Simão",
      heading: "Empresas & Iniciativas",
      description: "Negócios, produtos e organizações integradas sob o ecossistema Samuel Simão.",
    },
    {
      route: "/comunidade",
      title: "Comunidade — Samuel Simão",
      heading: "Comunidade de Criadores e Tecnologia",
      description:
        "Espaço de conversa, partilha de aprendizagem e networking entre criadores e entusiastas de tecnologia.",
    },
    {
      route: "/patrocinar",
      title: "Planos & Patrocínio — Samuel Simão",
      heading: "Planos, Membros & Patrocínio",
      description:
        "Apoia os projetos em público ou adquire acesso aos planos de acompanhamento e ferramentas exclusivas.",
    },
    {
      route: "/contacto",
      title: "Contacto — Samuel Simão",
      heading: "Fala Comigo",
      description:
        "Envia uma mensagem direta, solicita orçamento de software ou entra em contacto via WhatsApp.",
      schemaType: "ContactPage",
    },
    {
      route: "/termos",
      title: "Termos de Utilização — Samuel Simão",
      heading: "Termos de Utilização",
      description: "Termos e condições de uso da plataforma oficial de Samuel Simão.",
    },
    {
      route: "/privacidade",
      title: "Política de Privacidade — Samuel Simão",
      heading: "Política de Privacidade",
      description: "Política de privacidade e tratamento de dados na plataforma de Samuel Simão.",
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
    const canonical = `${SITE_URL}${route}`;
    const plain = stripMarkdown(p.content || p.excerpt || "");
    const words = plain ? plain.split(/\s+/).length : undefined;
    routeMap.set(route, {
      route,
      title: `${p.seo_title || p.title} — Samuel Simão`,
      heading: p.title,
      description: p.seo_description || p.excerpt || p.title,
      snippet: plain || p.excerpt || "",
      image: p.cover_image || p.coverImage || DEFAULT_IMAGE,
      type: "article",
      lastmod: (p.updated_at || p.created_at || p.createdAt || "").split("T")[0],
      breadcrumbs: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: p.title, path: route },
      ],
      jsonLd: {
        "@type": "Article",
        headline: p.title,
        description: clamp(p.seo_description || p.excerpt || p.title, 160),
        image: [p.cover_image || p.coverImage || DEFAULT_IMAGE],
        datePublished: p.created_at || p.createdAt || undefined,
        dateModified: p.updated_at || p.created_at || p.createdAt || undefined,
        inLanguage: "pt",
        wordCount: words,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        author: { "@type": "Person", name: p.authorName || "Samuel Simão", url: `${SITE_URL}/sobre` },
        publisher: { "@type": "Person", name: "Samuel Simão", url: `${SITE_URL}/` },
      },
    });
  }

  // Merge curated products & DB products
  const allProducts = [...curated.products, ...dbProducts];
  for (const prod of allProducts) {
    if (!prod?.id) continue;
    const route = `/produtos/${prod.id}`;
    const canonical = `${SITE_URL}${route}`;
    routeMap.set(route, {
      route,
      title: `${prod.name} — Samuel Simão`,
      heading: prod.name,
      description: prod.description || `Adquire ${prod.name} com Multicaixa Express, BAI Direto ou PayPal.`,
      snippet: prod.description || "",
      image: prod.image_url || DEFAULT_IMAGE,
      type: "product",
      lastmod: (prod.updated_at || prod.created_at || "").split("T")[0],
      breadcrumbs: [
        { name: "Início", path: "/" },
        { name: "Produtos", path: "/produtos" },
        { name: prod.name, path: route },
      ],
      jsonLd: {
        "@type": "Product",
        name: prod.name,
        description: clamp(prod.description || prod.name, 160),
        image: prod.image_url ? [prod.image_url] : [DEFAULT_IMAGE],
        brand: { "@type": "Brand", name: "Samuel Simão" },
        offers: {
          "@type": "Offer",
          url: canonical,
          price: String(prod.price ?? 0),
          priceCurrency: prod.currency || "AOA",
          availability: "https://schema.org/InStock",
          seller: { "@type": "Person", name: "Samuel Simão" },
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
  const prefixToLabel = {
    "/apps": "Apps & Programas",
    "/projetos": "Projetos",
    "/conteudos": "Conteúdos",
    "/ferramentas": "Ferramentas",
    "/lab": "Lab",
  };
  const allContent = [...curated.projects, ...curated.labItems, ...dbContentItems];
  for (const item of allContent) {
    const prefix = typeToPrefix[item?.type];
    if (!prefix || !item?.id) continue;
    const route = `${prefix}/${item.id}`;
    const canonical = `${SITE_URL}${route}`;
    const plainBody = stripMarkdown(item.body || item.description || "");
    routeMap.set(route, {
      route,
      title: `${item.title} — Samuel Simão`,
      heading: item.title,
      description: item.description || `${item.title} na plataforma Samuel Simão.`,
      snippet: plainBody || item.description || "",
      image: item.thumbnail_url || DEFAULT_IMAGE,
      type: item.type === "project" || item.type === "content" ? "article" : "website",
      lastmod: (item.updated_at || item.created_at || "").split("T")[0],
      breadcrumbs: [
        { name: "Início", path: "/" },
        { name: prefixToLabel[prefix], path: prefix },
        { name: item.title, path: route },
      ],
      jsonLd: {
        "@type": item.type === "app" ? "SoftwareApplication" : "CreativeWork",
        name: item.title,
        description: clamp(item.description || item.title, 160),
        image: item.thumbnail_url || DEFAULT_IMAGE,
        url: canonical,
        author: { "@type": "Person", name: "Samuel Simão" },
        ...(item.type === "app"
          ? {
              applicationCategory: "UtilitiesApplication",
              operatingSystem: item.platforms || "All",
              softwareVersion: item.version || "1.0",
              offers: {
                "@type": "Offer",
                price: String(item.price ?? 0),
                priceCurrency: "AOA",
              },
            }
          : {}),
      },
    });
  }

  // Merge DB businesses
  for (const biz of dbBusinesses) {
    if (!biz?.slug) continue;
    const route = `/empresas/${biz.slug}`;
    const canonical = `${SITE_URL}${route}`;
    routeMap.set(route, {
      route,
      title: `${biz.name} — Samuel Simão`,
      heading: biz.name,
      description: biz.description || biz.tagline || `${biz.name} — Empresa do ecossistema Samuel Simão.`,
      snippet: biz.description || biz.tagline || "",
      image: biz.logo_url || DEFAULT_IMAGE,
      type: "website",
      lastmod: (biz.updated_at || "").split("T")[0],
      breadcrumbs: [
        { name: "Início", path: "/" },
        { name: "Empresas", path: "/empresas" },
        { name: biz.name, path: route },
      ],
      jsonLd: {
        "@type": "Organization",
        name: biz.name,
        description: clamp(biz.description || biz.tagline || biz.name, 160),
        url: biz.website || canonical,
        logo: biz.logo_url || undefined,
        founder: { "@type": "Person", name: "Samuel Simão" },
      },
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const sitemapEntries = [];

  for (const meta of routeMap.values()) {
    const html = buildPageHtml(template, meta);
    writeRouteHtml(meta.route, html);
    sitemapEntries.push(
      `  <url><loc>${escapeHtml(`${SITE_URL}${meta.route === "/" ? "/" : meta.route}`)}</loc><lastmod>${meta.lastmod || today}</lastmod></url>`,
    );
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf8");

  console.log(
    `[prerender-seo] Pre-rendered ${routeMap.size} SEO/GEO routes and generated sitemap.xml (${sitemapEntries.length} URLs).`,
  );
}

main();
