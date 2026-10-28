import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Wrench, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { MediaBlock } from "@/components/media/MediaBlock";

export default function Ferramentas() {
  useSEO({
    title: "Ferramentas — Samuel Simão",
    description: "Ferramentas e recursos úteis para criadores, programadores e estudantes.",
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "tool")
        .neq("status", "archived")
        .order("title");
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Catálogo</p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">Ferramentas</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Coleção de ferramentas e recursos que uso ou recomendo.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Wrench} title="Sem ferramentas ainda" description="Em breve este catálogo será populado." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <Card key={item.id} className="group flex flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
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
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <Wrench className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                {item.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/ferramentas/${item.id}`}>
                      Detalhes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  {item.content_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.content_url} target="_blank" rel="noopener noreferrer">
                        Abrir <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
