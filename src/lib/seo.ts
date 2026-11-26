import { useEffect } from "react";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type SEOOptions = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const DEFAULT_DESCRIPTION =
  "Plataforma oficial de Samuel Simão: aplicações web, projetos de robótica e software, ferramentas, produtos digitais e artigos práticos sobre tecnologia.";
const DEFAULT_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f532055f-7af3-4c07-a111-be059db63d48/id-preview-f856f29e--1c48bd6f-9db4-4b93-9251-f34489991c6d.lovable.app-1775861842621.png";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeMeta(selector: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.remove();
}

function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const cleanPath = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, "") : "/";
    return `${parsed.origin}${cleanPath}`;
  } catch {
    return rawUrl;
  }
}

export function useSEO({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex = false,
  author = "Samuel Simão",
  publishedTime,
  modifiedTime,
  breadcrumbs,
  jsonLd,
}: SEOOptions) {
  useEffect(() => {
    const rawDesc = description?.trim() || DEFAULT_DESCRIPTION;
    const fullTitle = title.length > 60 ? title.slice(0, 57).trim() + "…" : title;
    const desc = rawDesc.length > 160 ? rawDesc.slice(0, 157).trim() + "…" : rawDesc;
    const ogImage = image || DEFAULT_IMAGE;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://samuel-sim.lovable.app";
    const rawUrl = canonical ?? (typeof window !== "undefined" ? origin + window.location.pathname : origin);
    const url = normalizeUrl(rawUrl);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", desc);
    upsertMeta('meta[name="author"]', "name", "author", author);
    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );

    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", desc);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", "Samuel Simão");
    if (url) {
      upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    }
    upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    upsertMeta('meta[property="og:image:alt"]', "property", "og:image:alt", fullTitle);

    if (type === "article" && publishedTime) {
      upsertMeta('meta[property="article:published_time"]', "property", "article:published_time", publishedTime);
    } else {
      removeMeta('meta[property="article:published_time"]');
    }

    if (type === "article" && modifiedTime) {
      upsertMeta('meta[property="article:modified_time"]', "property", "article:modified_time", modifiedTime);
    } else {
      removeMeta('meta[property="article:modified_time"]');
    }

    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:site"]', "name", "twitter:site", "@SamuelSimao");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    if (url) link.href = url;

    // Build Schema.org @graph combining supplied jsonLd + optional BreadcrumbList
    const graphNodes: Record<string, unknown>[] = [];
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const node of items) {
        if (Array.isArray((node as Record<string, unknown>)["@graph"])) {
          const inner = (node as Record<string, unknown>)["@graph"] as Record<string, unknown>[];
          graphNodes.push(...inner);
        } else {
          const { "@context": _ctx, ...rest } = node;
          graphNodes.push(rest);
        }
      }
    }

    if (breadcrumbs && breadcrumbs.length > 0 && !noindex) {
      graphNodes.push({
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: b.name,
          item: `${origin}${b.path === "/" ? "/" : b.path.replace(/\/+$/, "")}`,
        })),
      });
    }

    let script = document.head.querySelector<HTMLScriptElement>("script#dynamic-seo-jsonld");
    if (graphNodes.length > 0 && !noindex) {
      if (!script) {
        script = document.createElement("script");
        script.id = "dynamic-seo-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graphNodes,
      });
    } else if (script) {
      script.remove();
    }
  }, [
    title,
    description,
    canonical,
    image,
    type,
    noindex,
    author,
    publishedTime,
    modifiedTime,
    breadcrumbs,
    jsonLd,
  ]);
}
