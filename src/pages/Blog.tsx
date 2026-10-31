import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogCard } from "@/components/blog/BlogCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSEO } from "@/lib/seo";
import { db, repoTypeLabel } from "@/lib/repo";
import { CURATED_POSTS } from "@/lib/curatedContent";

export default function Blog() {
  useSEO({
    title: "Blog — Samuel Simão",
    description: "Artigos, projetos publicados, conteúdos, tutoriais e reflexões sobre tecnologia.",
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: feed = [], isLoading } = useQuery({
    queryKey: ["blog-unified-feed", selectedCategory],
    queryFn: async () => {
      let postsQuery = supabase
        .from("posts")
        .select("*, categories:category_id(name)")
        .eq("published", true)
        .order("created_at", { ascending: false });

      let repoQuery = db
        .from("content_items")
        .select("*, categories:category_id(name)")
        .in("type", ["project", "content"])
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        postsQuery = postsQuery.eq("category_id", selectedCategory);
        repoQuery = repoQuery.eq("category_id", selectedCategory);
      }

      const [postsRes, repoRes] = await Promise.all([postsQuery, repoQuery]);

      const selectedCatObj = categories.find((c: any) => c.id === selectedCategory);
      const selectedCatName = selectedCatObj ? selectedCatObj.name.toLowerCase() : null;

      const curatedEntries = CURATED_POSTS.filter((p) => {
        if (!selectedCatName) return true;
        return p.category.toLowerCase() === selectedCatName;
      }).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        category: p.category,
        accessLevel: p.accessLevel,
        createdAt: p.createdAt,
        typeBadge: "Artigo",
        href: `/blog/${p.slug}`,
      }));

      const postEntries = (postsRes.data ?? []).map((p: any) => ({
        id: `post-${p.id}`,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImage: p.cover_image,
        category: p.categories?.name ?? null,
        accessLevel: p.access_level ?? "public",
        createdAt: p.created_at,
        typeBadge: "Artigo",
        href: `/blog/${p.slug}`,
      }));

      const repoEntries = (repoRes.data ?? []).map((it: any) => ({
        id: `repo-${it.id}`,
        title: it.title,
        slug: it.id,
        excerpt: it.description ?? (it.body ? String(it.body).slice(0, 160) : null),
        coverImage: it.thumbnail_url ?? it.gallery?.[0] ?? null,
        category: it.categories?.name ?? null,
        accessLevel: it.is_premium ? "premium" : "public",
        createdAt: it.created_at,
        typeBadge: repoTypeLabel[it.type] ?? it.type,
        href: `/blog/${it.id}`,
      }));

      // Combine and deduplicate by slug
      const combined = [...curatedEntries, ...postEntries, ...repoEntries];
      const seen = new Set<string>();
      const deduplicated = combined.filter((entry) => {
        if (seen.has(entry.slug)) return false;
        seen.add(entry.slug);
        return true;
      });

      return deduplicated.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
  });

  const filtered = feed.filter(
    (p: any) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground">Blog</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Artigos, projetos publicados, conteúdos e reflexões sobre tecnologia e desenvolvimento.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar artigos, projetos e conteúdos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Badge>
          {categories.map((cat: any) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">Nenhuma publicação encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post: any) => (
            <BlogCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              category={post.category}
              accessLevel={post.accessLevel}
              createdAt={post.createdAt}
              typeBadge={post.typeBadge}
              href={post.href}
            />
          ))}
        </div>
      )}
    </div>
  );
}
