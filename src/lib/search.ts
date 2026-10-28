import { supabase } from "@/integrations/supabase/client";
import { repoTypePath } from "@/lib/repo";

export type SearchType = "all" | "post" | "project" | "product";

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  description: string;
  url: string;
  rank: number;
}

const db = supabase as any;

export async function globalSearch(query: string, type: SearchType = "all"): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const { data, error } = await db.rpc("global_search", { _query: q, _type: type });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data as SearchResult[];
    }
  } catch {
    // Fallback to direct table search below
  }

  const pattern = `%${q}%`;
  const results: SearchResult[] = [];

  const [postsRes, itemsRes, productsRes] = await Promise.all([
    type === "all" || type === "post"
      ? db
          .from("posts")
          .select("id,title,slug,excerpt")
          .eq("published", true)
          .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
          .limit(8)
      : Promise.resolve({ data: [] }),
    type === "all" || type === "project"
      ? db
          .from("content_items")
          .select("id,title,description,type")
          .neq("status", "archived")
          .or(`title.ilike.${pattern},description.ilike.${pattern}`)
          .limit(10)
      : Promise.resolve({ data: [] }),
    type === "all" || type === "product"
      ? db
          .from("products")
          .select("id,name,description")
          .eq("is_active", true)
          .or(`name.ilike.${pattern},description.ilike.${pattern}`)
          .limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  for (const p of postsRes.data ?? []) {
    results.push({
      id: p.id,
      type: "post",
      title: p.title,
      description: p.excerpt ?? "",
      url: `/blog/${p.slug}`,
      rank: 1,
    });
  }

  for (const it of itemsRes.data ?? []) {
    const basePath = repoTypePath[it.type] ?? "/projetos";
    results.push({
      id: it.id,
      type: "project",
      title: it.title,
      description: it.description ?? "",
      url: `${basePath}/${it.id}`,
      rank: 0.9,
    });
  }

  for (const prod of productsRes.data ?? []) {
    results.push({
      id: prod.id,
      type: "product",
      title: prod.name,
      description: prod.description ?? "",
      url: `/produtos/${prod.id}`,
      rank: 0.85,
    });
  }

  return results;
}
