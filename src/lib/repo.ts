import { supabase } from "@/integrations/supabase/client";

export const db = supabase as any;

export function formatPrice(value: number | null | undefined, currency = "AOA") {
  const n = Number(value ?? 0);
  if (!n) return "Gratuito";
  try {
    return new Intl.NumberFormat("pt-AO", { style: "currency", currency }).format(n);
  } catch {
    return `${n.toLocaleString("pt-PT")} ${currency}`;
  }
}

export function whatsappHref(v?: string | null, text?: string) {
  if (!v) return null;
  if (/^https?:\/\//.test(v)) return v;
  const digits = v.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const repoTypeLabel: Record<string, string> = {
  app: "App / Programa",
  project: "Projeto",
  content: "Conteúdo",
  tool: "Ferramenta",
  lab: "Lab",
};

export const repoTypePath: Record<string, string> = {
  app: "/apps",
  project: "/projetos",
  content: "/conteudos",
  tool: "/ferramentas",
  lab: "/lab",
};
