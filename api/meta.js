export const config = {
  runtime: "edge",
};

const SUPABASE_URL = "https://eagqdnmzgoodmxfkqprd.supabase.co";
const SUPABASE_KEY = "sb_publishable_VAKy-L2r4tZeWEKiczfHlg_J999Ndo5";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f532055f-7af3-4c07-a111-be059db63d48/id-preview-f856f29e--1c48bd6f-9db4-4b93-9251-f34489991c6d.lovable.app-1775861842621.png";
const DEFAULT_DESCRIPTION =
  "Plataforma oficial de Samuel Simão: aplicações web, projetos de robótica e software, ferramentas, produtos digitais e artigos práticos sobre tecnologia.";

const STATIC_PAGE_META = {
  "/": {
    title: "Samuel Simão — Tecnologia, Software & Automação",
    heading: "Samuel Simão",
    description:
      "Criador de tecnologia, software e ferramentas digitais em Luanda, Angola. Aplicações web, robótica prática e artigos objetivos.",
    snippet:
      "Samuel Simão é developer, criador de tecnologia e empreendedor digital em Luanda, Angola. Constrói aplicações web, projetos de eletrónica e robótica (REPI Rover), automações com IA (Pafiworky) e produtos digitais com pagamento via Multicaixa Express, BAI Direto e PayPal.",
  },
  "/sobre": {
    title: "Sobre — Samuel Simão",
    heading: "Sobre Samuel Simão",
    description:
      "Conheça o meu percurso em Eletrónica, Telecomunicações e Engenharia de Software, os meus princípios e os projetos que construo.",
    schemaType: "ProfilePage",
  },
  "/apps": {
    title: "Apps & Programas — Samuel Simão",
    heading: "Apps & Programas",
    description:
      "Aplicações web e softwares construídos por Samuel Simão prontos para executar diretamente no navegador ou transferir.",
  },
  "/projetos": {
    title: "Projetos & Engenharia — Samuel Simão",
    heading: "Projetos & Engenharia",
    description:
      "Portfólio de projetos de robótica, automação, hardware e plataformas web como o REPI Rover, Pafiworky e Samuka Play.",
  },
  "/conteudos": {
    title: "Conteúdos — Samuel Simão",
    heading: "Repositório de Conteúdos",
    description:
      "Artigos técnicos, guias práticos, materiais de estudo e recursos educativos publicados por Samuel Simão.",
  },
  "/produtos": {
    title: "Produtos & Serviços — Samuel Simão",
    heading: "Produtos & Serviços Digitais",
    description:
      "Templates, guias práticos e consultoria técnica com pagamento rápido via Multicaixa Express, BAI Direto e PayPal.",
  },
  "/ferramentas": {
    title: "Ferramentas Recomendadas — Samuel Simão",
    heading: "Ferramentas & Stack",
    description:
      "Coleção curada das ferramentas digitais, motores de IA e utilitários que utilizo diariamente para construir projetos.",
  },
  "/lab": {
    title: "Lab Experimental — Samuel Simão",
    heading: "Laboratório de Ideias & Protótipos",
    description:
      "Experiências em curso, pipelines de automação com IA e protótipos interativos em fase de validação.",
  },
  "/blog": {
    title: "Blog & Artigos — Samuel Simão",
    heading: "Blog de Tecnologia e Empreendedorismo",
    description:
      "Artigos práticos sobre tecnologia, inteligência artificial, funcionamento da Internet, engenharia e visão de negócio.",
  },
  "/empresas": {
    title: "Empresas & Marcas — Samuel Simão",
    heading: "Empresas & Iniciativas",
    description: "Negócios, produtos e organizações integradas sob o ecossistema Samuel Simão.",
  },
  "/comunidade": {
    title: "Comunidade — Samuel Simão",
    heading: "Comunidade de Criadores e Tecnologia",
    description: "Espaço de conversa, partilha de aprendizagem e networking entre criadores e entusiastas de tecnologia.",
  },
  "/patrocinar": {
    title: "Planos & Patrocínio — Samuel Simão",
    heading: "Planos, Membros & Patrocínio",
    description: "Apoia os projetos em público ou adquire acesso aos planos de acompanhamento e ferramentas exclusivas.",
  },
  "/contacto": {
    title: "Contacto — Samuel Simão",
    heading: "Fala Comigo",
    description: "Envia uma mensagem direta, solicita orçamento de software ou entra em contacto via WhatsApp.",
    schemaType: "ContactPage",
  },
  "/termos": {
    title: "Termos de Utilização — Samuel Simão",
    heading: "Termos de Utilização",
    description: "Termos e condições de uso da plataforma oficial de Samuel Simão.",
  },
  "/privacidade": {
    title: "Política de Privacidade — Samuel Simão",
    heading: "Política de Privacidade",
    description: "Política de privacidade e tratamento de dados na plataforma de Samuel Simão.",
  },
};

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

async function resolveMetadata(pathname, origin) {
  const clean = pathname.replace(/\/+$/, "") || "/";

  const staticMeta = STATIC_PAGE_META[clean];
  if (staticMeta) {
    const url = `${origin}${clean === "/" ? "/" : clean}`;
    const personNode = {
      "@type": "Person",
      "@id": `${origin}/#person`,
      name: "Samuel Simão",
      jobTitle: "Criador de Tecnologia, Developer e Empreendedor Digital",
      url: `${origin}/`,
      homeLocation: { "@type": "Place", name: "Luanda, Angola" },
      knowsAbout: ["Engenharia de Software", "Eletrónica e Telecomunicações", "Robótica", "Automação", "Inteligência Artificial"],
    };
    const graph =
      clean === "/"
        ? [
            personNode,
            {
              "@type": "WebSite",
              "@id": `${origin}/#website`,
              name: "Samuel Simão",
              url: `${origin}/`,
              inLanguage: "pt",
              publisher: { "@id": `${origin}/#person` },
              potentialAction: {
                "@type": "SearchAction",
                target: `${origin}/blog?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]
        : [
            {
              "@type": staticMeta.schemaType || "WebPage",
              name: staticMeta.heading,
              description: clamp(staticMeta.description, 160),
              url,
              inLanguage: "pt",
              ...(staticMeta.schemaType === "ProfilePage" ? { mainEntity: personNode } : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: `${origin}/` },
                { "@type": "ListItem", position: 2, name: staticMeta.heading, item: url },
              ],
            },
          ];

    return {
      status: 200,
      title: staticMeta.title,
      heading: staticMeta.heading,
      description: staticMeta.description,
      snippet: staticMeta.snippet || staticMeta.description,
      image: DEFAULT_IMAGE,
      type: "website",
      breadcrumbs: clean === "/" ? [] : [{ name: "Início", path: "/" }, { name: staticMeta.heading, path: clean }],
      jsonLd: { "@context": "https://schema.org", "@graph": graph },
    };
  }

  if (clean.startsWith("/blog/")) {
    const slug = decodeURIComponent(clean.slice("/blog/".length));
    const post = await queryOne(
      "posts",
      `select=title,slug,excerpt,content,cover_image,created_at,updated_at,seo_title,seo_description&slug=eq.${encodeURIComponent(slug)}&published=eq.true`,
    );
    if (post) {
      const canonical = `${origin}/blog/${post.slug}`;
      const plain = stripMarkdown(post.content || post.excerpt || "");
      const words = plain ? plain.split(/\s+/).length : undefined;
      return {
        status: 200,
        title: `${post.seo_title || post.title} — Samuel Simão`,
        heading: post.title,
        description: post.seo_description || post.excerpt || DEFAULT_DESCRIPTION,
        snippet: clamp(plain || post.excerpt || "", 600),
        image: post.cover_image || DEFAULT_IMAGE,
        type: "article",
        breadcrumbs: [
          { name: "Início", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ],
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: post.title,
              description: clamp(post.seo_description || post.excerpt || post.title, 160),
              image: [post.cover_image || DEFAULT_IMAGE],
              datePublished: post.created_at,
              dateModified: post.updated_at || post.created_at,
              inLanguage: "pt",
              wordCount: words,
              mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
              author: { "@type": "Person", name: "Samuel Simão", url: `${origin}/sobre` },
              publisher: { "@type": "Person", name: "Samuel Simão", url: `${origin}/` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: `${origin}/` },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: canonical },
              ],
            },
          ],
        },
      };
    }
    return null;
  }

  if (clean.startsWith("/produtos/")) {
    const id = decodeURIComponent(clean.slice("/produtos/".length));
    const prod = await queryOne(
      "products",
      `select=id,name,description,price,currency,image_url,type&id=eq.${encodeURIComponent(id)}&is_active=eq.true`,
    );
    if (prod) {
      const canonical = `${origin}/produtos/${prod.id}`;
      return {
        status: 200,
        title: `${prod.name} — Samuel Simão`,
        heading: prod.name,
        description: prod.description || DEFAULT_DESCRIPTION,
        snippet: clamp(prod.description || "", 500),
        image: prod.image_url || DEFAULT_IMAGE,
        type: "product",
        breadcrumbs: [
          { name: "Início", path: "/" },
          { name: "Produtos", path: "/produtos" },
          { name: prod.name, path: `/produtos/${prod.id}` },
        ],
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: prod.name,
              description: clamp(prod.description || prod.name, 160),
              image: [prod.image_url || DEFAULT_IMAGE],
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
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: `${origin}/` },
                { "@type": "ListItem", position: 2, name: "Produtos", item: `${origin}/produtos` },
                { "@type": "ListItem", position: 3, name: prod.name, item: canonical },
              ],
            },
          ],
        },
      };
    }
    return null;
  }

  const repoMatch = clean.match(/^\/(apps|projetos|conteudos|ferramentas|lab)\/([^/]+)$/);
  if (repoMatch) {
    const section = repoMatch[1];
    const id = decodeURIComponent(repoMatch[2]);
    const item = await queryOne(
      "content_items",
      `select=id,type,title,description,body,thumbnail_url,platforms,version,price,created_at,updated_at&id=eq.${encodeURIComponent(id)}&status=neq.archived`,
    );
    if (item) {
      const canonical = `${origin}/${section}/${item.id}`;
      const plainBody = stripMarkdown(item.body || item.description || "");
      const sectionNames = {
        apps: "Apps & Programas",
        projetos: "Projetos",
        conteudos: "Conteúdos",
        ferramentas: "Ferramentas",
        lab: "Lab",
      };
      return {
        status: 200,
        title: `${item.title} — Samuel Simão`,
        heading: item.title,
        description: item.description || DEFAULT_DESCRIPTION,
        snippet: clamp(plainBody || item.description || "", 550),
        image: item.thumbnail_url || DEFAULT_IMAGE,
        type: item.type === "project" || item.type === "content" ? "article" : "website",
        breadcrumbs: [
          { name: "Início", path: "/" },
          { name: sectionNames[section] || section, path: `/${section}` },
          { name: item.title, path: `/${section}/${item.id}` },
        ],
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            {
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
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: `${origin}/` },
                { "@type": "ListItem", position: 2, name: sectionNames[section] || section, item: `${origin}/${section}` },
                { "@type": "ListItem", position: 3, name: item.title, item: canonical },
              ],
            },
          ],
        },
      };
    }
    return null;
  }

  if (clean.startsWith("/empresas/")) {
    const slug = decodeURIComponent(clean.slice("/empresas/".length));
    const biz = await queryOne(
      "businesses",
      `select=name,slug,tagline,description,logo_url,website&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true`,
    );
    if (biz) {
      const canonical = `${origin}/empresas/${biz.slug}`;
      return {
        status: 200,
        title: `${biz.name} — Samuel Simão`,
        heading: biz.name,
        description: biz.description || biz.tagline || DEFAULT_DESCRIPTION,
        snippet: clamp(biz.description || biz.tagline || "", 500),
        image: biz.logo_url || DEFAULT_IMAGE,
        type: "website",
        breadcrumbs: [
          { name: "Início", path: "/" },
          { name: "Empresas", path: "/empresas" },
          { name: biz.name, path: `/empresas/${biz.slug}` },
        ],
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: biz.name,
              description: clamp(biz.description || biz.tagline || biz.name, 160),
              url: biz.website || canonical,
              logo: biz.logo_url || undefined,
              founder: { "@type": "Person", name: "Samuel Simão" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: `${origin}/` },
                { "@type": "ListItem", position: 2, name: "Empresas", item: `${origin}/empresas` },
                { "@type": "ListItem", position: 3, name: biz.name, item: canonical },
              ],
            },
          ],
        },
      };
    }
    return null;
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
  const cleanTarget = targetPath.length > 1 ? targetPath.replace(/\/+$/, "") : "/";
  const canonical = `${origin}${cleanTarget}`;

  const [meta, baseRes] = await Promise.all([
    resolveMetadata(cleanTarget, origin),
    fetch(`${origin}/index.html`),
  ]);

  let html = baseRes.ok
    ? await baseRes.text()
    : `<!doctype html><html lang="pt"><head><meta charset="UTF-8" /><title>Samuel Simão</title><meta name="description" content="${esc(DEFAULT_DESCRIPTION)}" /></head><body><div id="root"></div></body></html>`;

  if (meta?.notFound) {
    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, "<title>Página não encontrada — Samuel Simão</title>")
      .replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, '<meta name="robots" content="noindex, nofollow" />');
    return new Response(html, {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

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

    const crumbsHtml =
      meta.breadcrumbs && meta.breadcrumbs.length > 0
        ? `<nav aria-label="Breadcrumb" style="font-size:13px;color:#666;margin-bottom:12px">${meta.breadcrumbs
            .map((b) => `<a href="${esc(b.path)}">${esc(b.name)}</a>`)
            .join(" / ")}</nav>`
        : "";
    const bodyHtml = `<div id="root"><main style="max-width:760px;margin:48px auto;padding:0 20px;font-family:system-ui,-apple-system,sans-serif;color:#111">${crumbsHtml}<article><header><p style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#666">Samuel Simão</p><h1 style="font-size:28px;margin:8px 0">${esc(meta.heading || title)}</h1></header><p style="font-size:16px;line-height:1.6;color:#333">${esc(desc)}</p>${meta.snippet && meta.snippet !== desc ? `<p style="font-size:15px;line-height:1.7;color:#444;margin-top:12px">${esc(meta.snippet)}</p>` : ""}</article><nav aria-label="Navegação principal" style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;font-size:14px"><a href="/">Início</a><a href="/sobre">Sobre</a><a href="/apps">Apps</a><a href="/projetos">Projetos</a><a href="/produtos">Produtos</a><a href="/blog">Blog</a><a href="/contacto">Contacto</a></nav></main></div>`;

    html = html.replace(/<div\s+id="root">[\s\S]*?<\/div>(?=\s*<script)/i, bodyHtml);
  }

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
