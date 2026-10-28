import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { MediaBlock } from "@/components/media/MediaBlock";

export default function Projetos() {
  useSEO({
    title: "Projetos — Samuel Simão",
    description: "Portfolio de projetos digitais, experiências e trabalhos realizados.",
  });
  const [selected, setSelected] = useState<string | null>(null);

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
      if (selected) q = q.eq("category_id", selected);
      const { data } = await q;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground">Projetos</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Trabalhos, produtos digitais e experiências que construí.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Badge
            variant={selected === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelected(null)}
          >
            Todos
          </Badge>
          {categories.map((c: any) => (
            <Badge
              key={c.id}
              variant={selected === c.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelected(c.id)}
            >
              {c.name}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Sem projetos ainda"
          description="Brevemente serão publicados aqui novos projetos."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <Card key={item.id} className="group overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
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
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                )}
                {item.content_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={item.content_url} target="_blank" rel="noopener noreferrer">
                      Ver projeto
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
