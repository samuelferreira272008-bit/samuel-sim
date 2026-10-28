import { useEffect } from "react";

type SEOOptions = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const DEFAULT_DESCRIPTION =
  "Plataforma de Samuel Simão para conteúdos, projetos, aplicações, ferramentas, comunidade e formação em tecnologia.";
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

export function useSEO({ title, description, canonical, image, type = "website", jsonLd }: SEOOptions) {
  useEffect(() => {
    const rawDesc = description?.trim() || DEFAULT_DESCRIPTION;
    const fullTitle = title.length > 60 ? title.slice(0, 57).trim() + "…" : title;
    const desc = rawDesc.length > 160 ? rawDesc.slice(0, 157).trim() + "…" : rawDesc;
    const ogImage = image || DEFAULT_IMAGE;
    const url = canonical ?? (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", desc);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", desc);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", "Samuel Simão");
    if (url) {
      upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    }
    upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
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

    let script = document.head.querySelector<HTMLScriptElement>('script#dynamic-seo-jsonld');
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = "dynamic-seo-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, image, type, jsonLd]);
}
