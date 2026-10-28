import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, ExternalLink, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { MediaBlock } from "@/components/media/MediaBlock";

const tierLabel: Record<string, string> = {
  wip: "Em desenvolvimento",
  alpha: "Alpha",
  beta: "Beta",
  published: "Estável",
};

export default function Lab() {
  useSEO({
    title: "Lab — Samuel Simão",
    description: "Experiências, protótipos e ideias em desenvolvimento.",
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["lab"],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", "lab")
        .neq("status", "archived")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Experimental</p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">Lab</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Experiências, protótipos e ideias em desenvolvimento.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FlaskConical} title="Lab vazio" description="Sem experiências publicadas neste momento." />
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
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge variant="secondary">{tierLabel[item.status] ?? item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                {item.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/lab/${item.id}`}>
                      Detalhes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  {item.content_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.content_url} target={item.content_url.startsWith("/") ? "_self" : "_blank"} rel="noopener noreferrer">
                        Experimentar <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
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
