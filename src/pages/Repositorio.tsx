import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Download, Play, AppWindow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AppRunnerModal } from "@/components/repo/AppRunner";
import { GlowCard } from "@/components/visuals/GlowCard";
import { LottiePlayPulse } from "@/components/visuals/LottieMicro";
import { useSEO } from "@/lib/seo";
import { db, formatPrice, repoTypePath } from "@/lib/repo";

const config: Record<string, { title: string; subtitle: string; eyebrow: string }> = {
  app: {
    title: "Apps & Programas",
    subtitle: "Softwares, aplicações e programas prontos para executar no navegador ou descarregar.",
    eyebrow: "Repositório de Software",
  },
  project: {
    title: "Projetos",
    subtitle: "Trabalhos, produtos digitais e experiências que construí em público.",
    eyebrow: "Portfólio & Engenharia",
  },
  content: {
    title: "Conteúdos",
    subtitle: "Artigos, tutoriais técnicos, guias, vídeos e materiais educativos.",
    eyebrow: "Publicações",
  },
};

export default function Repositorio({ type }: { type: "app" | "project" | "content" }) {
  const c = config[type];
  useSEO({ title: `${c.title} — Samuel Simão`, description: c.subtitle });
  const [q, setQ] = useState("");
  const [runningApp, setRunningApp] = useState<{ title: string; url: string } | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["repo", type],
    queryFn: async () =>
      (
        await db
          .from("content_items")
          .select("*")
          .eq("type", type)
          .neq("status", "archived")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const shown = items.filter((i: any) =>
    `${i.title} ${i.description ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {c.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        {c.title}
      </h1>
      <p className="mt-2 text-base sm:text-lg text-muted-foreground">{c.subtitle}</p>

      <div className="mb-6 sm:mb-8 mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <Input
          className="w-full sm:max-w-sm h-11 sm:h-10 rounded-xl"
          placeholder="Pesquisar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {type === "app" && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AppWindow className="h-3.5 w-3.5 text-foreground shrink-0" />
            <span>Aplicações com execução direta em sandbox</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nada por aqui ainda"
          description="Brevemente novas publicações neste repositório."
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it: any) => {
            const img = it.thumbnail_url ?? it.gallery?.[0];
            const hasWebUrl = !!it.content_url;

            return (
              <GlowCard
                key={it.id}
                enableTilt={true}
                className="flex flex-col justify-between"
              >
                <Link to={`${repoTypePath[type]}/${it.id}`} className="block">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    {img ? (
                      <img
                        src={img}
                        alt={it.title}
                        className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                          it.transparent_thumbnail ? "object-contain p-6" : "object-cover"
                        }`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FolderOpen className="h-10 w-10 text-muted-foreground/60" />
                      </div>
                    )}
                    {hasWebUrl && (
                      <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-xs border border-border/80">
                        <LottiePlayPulse className="h-3.5 w-3.5" /> Executável
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 p-4 sm:p-5">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {type === "app" && (
                        <Badge variant="secondary" className="font-semibold text-xs">
                          {formatPrice(it.price)}
                        </Badge>
                      )}
                      {it.version && <Badge variant="outline">v{it.version}</Badge>}
                      {it.download_url && (
                        <Badge variant="outline" className="gap-1">
                          <Download className="h-3 w-3" /> Download
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-foreground/90 transition-colors">
                      {it.title}
                    </h3>
                    {it.description && (
                      <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {it.description}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between border-t border-border/60 p-3 sm:p-4 bg-secondary/20 gap-2">
                  <Button variant="ghost" size="sm" asChild className="text-xs min-h-[40px] px-3">
                    <Link to={`${repoTypePath[type]}/${it.id}`}>Ver Detalhes</Link>
                  </Button>

                  {hasWebUrl && (
                    <Button
                      size="sm"
                      onClick={() => setRunningApp({ title: it.title, url: it.content_url })}
                      className="text-xs font-semibold shadow-xs min-h-[40px] px-3.5"
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Executar App
                    </Button>
                  )}
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}

      {/* Instant Runner Modal */}
      <AppRunnerModal
        open={!!runningApp}
        onOpenChange={(open) => !open && setRunningApp(null)}
        title={runningApp?.title ?? ""}
        url={runningApp?.url ?? ""}
      />
    </div>
  );
}
