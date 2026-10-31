import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, ExternalLink, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { MediaBlock } from "@/components/media/MediaBlock";
import { Lab3DCanvas } from "@/components/visuals/Lab3DCanvas";

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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Experimental</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Lab</h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Experiências interativas, protótipos de computação gráfica e conceitos em desenvolvimento.
        </p>
      </div>

      {/* Interactive 3D WebGL Three.js Spatial Playground */}
      <Lab3DCanvas />

      {/* Lab Experiment Items */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-6">
          Protótipos & Pesquisas
        </h2>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="Lab vazio no momento"
            description="Sem experiências arquivadas neste momento. Experimente o simulador 3D acima!"
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
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      <Badge variant="secondary">{tierLabel[item.status] ?? item.status}</Badge>
                    </div>
                    {item.description && (
                      <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                    <Button variant="secondary" size="sm" asChild className="rounded-xl">
                      <Link to={`/lab/${item.id}`}>
                        Detalhes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    {item.content_url && (
                      <Button variant="outline" size="sm" asChild className="rounded-xl">
                        <a href={item.content_url} target={item.content_url.startsWith("/") ? "_self" : "_blank"} rel="noopener noreferrer">
                          Experimentar <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
