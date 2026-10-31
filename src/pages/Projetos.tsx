import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { MediaBlock } from "@/components/media/MediaBlock";
import { SegmentedControl } from "@/components/visuals/SegmentedControl";

export default function Projetos() {
  useSEO({
    title: "Projetos — Samuel Simão",
    description: "Portfolio de projetos digitais, experiências e trabalhos realizados.",
  });
  const [selected, setSelected] = useState<string>("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["projects", selected],
    queryFn: async () => {
      let q = supabase
        .from("content_items")
        .select("*")
        .eq("type", "project")
        .order("created_at", { ascending: false });
      if (selected !== "all") q = q.eq("category_id", selected);
      const { data } = await q;
      return data ?? [];
    },
  });

  const categoryOptions = [
    { value: "all", label: "Todos" },
    ...categories.map((c: any) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Portfólio</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Projetos</h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Trabalhos, produtos digitais e experiências construídas com precisão.
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Sem projetos encontrados"
          description="Brevemente serão publicados aqui novos projetos nesta categoria."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <div key={item.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm">
              {(item.thumbnail_url || item.video_url) && (
                <MediaBlock
                  imageUrl={item.thumbnail_url}
                  videoUrl={item.video_url}
                  transparent={item.transparent_thumbnail}
                  fit={item.transparent_thumbnail ? "contain" : "cover"}
                  aspect="aspect-video"
                  rounded={false}
                />
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.content_url && (
                  <div className="mt-5 pt-3 border-t border-border/40">
                    <Button variant="outline" size="sm" asChild className="rounded-xl font-medium">
                      <a href={item.content_url} target="_blank" rel="noopener noreferrer">
                        Ver projeto
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
