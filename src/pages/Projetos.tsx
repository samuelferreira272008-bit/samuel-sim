import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { MediaBlock } from "@/components/media/MediaBlock";
import { SegmentedControl } from "@/components/visuals/SegmentedControl";
import { GlowCard } from "@/components/visuals/GlowCard";
import { CURATED_PROJECTS } from "@/lib/curatedContent";

export default function Projetos() {
  useSEO({
    title: "Projetos — Samuel Simão",
    description: "Portfólio de projetos digitais, automação, robótica e experiências construídas por Samuel Simão.",
  });
  const [selected, setSelected] = useState<string>("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: dbProjects = [], isLoading } = useQuery({
    queryKey: ["projects-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "project")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const allItems = useMemo(() => {
    const catMap = new Map<string, string>();
    for (const c of categories as Array<{ id: string; name: string }>) {
      catMap.set(c.id, c.name);
    }

    type RawItem = {
      id: string;
      title: string;
      description?: string | null;
      thumbnail_url?: string | null;
      video_url?: string | null;
      transparent_thumbnail?: boolean | null;
      content_url?: string | null;
      status?: string | null;
      category_id?: string | null;
      category_name?: string;
    };

    const combined = ([...CURATED_PROJECTS, ...dbProjects] as RawItem[]).map((it) => ({
      ...it,
      resolvedCategory: it.category_name || (it.category_id ? catMap.get(it.category_id) : undefined) || "Projeto",
    }));

    const seen = new Set<string>();
    return combined.filter((it) => {
      const key = it.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories, dbProjects]);

  const categoryOptions = useMemo(() => {
    const uniqueCats = Array.from(new Set(allItems.map((it) => it.resolvedCategory).filter(Boolean)));
    return [
      { value: "all", label: "Todos" },
      ...uniqueCats.map((name) => ({ value: name, label: name })),
    ];
  }, [allItems]);

  const items = useMemo(() => {
    if (selected === "all") return allItems;
    return allItems.filter((it) => it.resolvedCategory === selected);
  }, [allItems, selected]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Portfólio</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Projetos</h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Trabalhos, produtos digitais e sistemas práticos construídos por mim com precisão.
        </p>
      </div>

      {categoryOptions.length > 1 && (
        <div className="mb-8 overflow-x-auto pb-1">
          <SegmentedControl
            name="projects-filter"
            options={categoryOptions}
            value={selected}
            onChange={setSelected}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Sem projetos encontrados"
          description="Brevemente publicarei aqui novos projetos nesta categoria."
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <GlowCard key={item.id} enableTilt={true} className="flex flex-col justify-between overflow-hidden">
              <div>
                {(item.thumbnail_url || item.video_url) && (
                  <Link to={`/projetos/${item.id}`} className="block">
                    <MediaBlock
                      imageUrl={item.thumbnail_url}
                      videoUrl={item.video_url}
                      transparent={item.transparent_thumbnail}
                      fit={item.transparent_thumbnail ? "contain" : "cover"}
                      aspect="aspect-video"
                      rounded={false}
                    />
                  </Link>
                )}
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {item.resolvedCategory && (
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {item.resolvedCategory}
                      </Badge>
                    )}
                    {item.status && item.status !== "published" && (
                      <Badge variant="outline" className="text-[11px] uppercase">
                        {item.status}
                      </Badge>
                    )}
                  </div>
                  <Link to={`/projetos/${item.id}`} className="group block">
                    <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                  </Link>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="mt-5 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2">
                  <Button variant="default" size="sm" asChild className="min-h-[44px] sm:min-h-[36px] flex-1 sm:flex-none rounded-xl font-medium">
                    <Link to={`/projetos/${item.id}`}>
                      Detalhes
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  {item.content_url && (
                    <Button variant="outline" size="sm" asChild className="min-h-[44px] sm:min-h-[36px] flex-1 sm:flex-none rounded-xl font-medium">
                      <a href={item.content_url} target="_blank" rel="noopener noreferrer">
                        Abrir
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}
