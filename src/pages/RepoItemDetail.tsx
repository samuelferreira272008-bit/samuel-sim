import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Play,
  AppWindow,
  Eye,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaBlock } from "@/components/media/MediaBlock";
import { AppRunner } from "@/components/repo/AppRunner";
import { useSEO } from "@/lib/seo";
import { db, formatPrice, repoTypeLabel, repoTypePath } from "@/lib/repo";

export default function RepoItemDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const autoRun = searchParams.get("run") === "true";

  const [active, setActive] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(autoRun);

  const { data: it, isLoading } = useQuery({
    queryKey: ["repo-item", id],
    queryFn: async () =>
      (await db.from("content_items").select("*").eq("id", id).maybeSingle()).data,
  });

  useEffect(() => {
    if (autoRun && it?.content_url) {
      setIsRunning(true);
    }
  }, [autoRun, it?.content_url]);

  useSEO({
    title: it ? `${it.title} — Samuel Simão` : "Samuel Simão",
    description: it?.description ?? undefined,
    image: it?.thumbnail_url ?? it?.gallery?.[0] ?? null,
    type: it?.type === "content" || it?.type === "project" ? "article" : "website",
    jsonLd: it
      ? {
          "@context": "https://schema.org",
          "@type": it.type === "app" ? "SoftwareApplication" : "CreativeWork",
          name: it.title,
          description: it.description ?? "",
          image: it.thumbnail_url ?? it.gallery?.[0] ?? undefined,
          ...(it.type === "app"
            ? {
                applicationCategory: "UtilitiesApplication",
                operatingSystem: it.platforms || "All",
                softwareVersion: it.version || "1.0",
              }
            : {}),
        }
      : undefined,
  });

  if (isLoading)
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  if (!it)
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">
        Item não encontrado.
      </div>
    );

  const back = repoTypePath[it.type] ?? "/";
  const gallery: string[] = it.gallery ?? [];
  const isApp = it.type === "app";
  const paid = Number(it.price) > 0;
  const hasExecutableUrl = !!it.content_url;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      {/* Navigation breadcrumb */}
      <Link
        to={back}
        className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> {repoTypeLabel[it.type] ?? "Voltar"}
      </Link>

      {/* Badges Bar */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Badge variant="secondary">{repoTypeLabel[it.type] ?? it.type}</Badge>
        {isApp && <Badge>{formatPrice(it.price)}</Badge>}
        {it.version && <Badge variant="outline">v{it.version}</Badge>}
        {it.platforms && <Badge variant="outline">{it.platforms}</Badge>}
        {hasExecutableUrl && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <AppWindow className="h-3.5 w-3.5 text-foreground" /> Executável por Iframe
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        {it.title}
      </h1>
      {it.description && (
        <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">{it.description}</p>
      )}

      {/* Main Action Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Run in Iframe button */}
        {hasExecutableUrl && (
          <Button
            size="lg"
            onClick={() => setIsRunning((r) => !r)}
            className="shadow-glow font-semibold min-h-[44px] w-full sm:w-auto justify-center"
          >
            {isRunning ? (
              <>
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes / Ocultar
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 fill-current" /> Executar App na Plataforma
              </>
            )}
          </Button>
        )}

        {/* Download File */}
        {it.download_url && (!paid || !it.content_url) && (
          <Button size="lg" variant="outline" asChild className="min-h-[44px] w-full sm:w-auto justify-center">
            <a href={it.download_url} target="_blank" rel="noopener noreferrer" download>
              <Download className="mr-2 h-4 w-4" /> Download
            </a>
          </Button>
        )}

        {/* External Link */}
        {it.content_url && (
          <Button
            size="lg"
            variant={hasExecutableUrl && !isRunning ? "outline" : "secondary"}
            asChild
            className="min-h-[44px] w-full sm:w-auto justify-center"
          >
            <a href={it.content_url} target="_blank" rel="noopener noreferrer">
              <span>{isApp && paid ? "Comprar / Obter" : "Abrir em Nova Aba"}</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      {/* Dedicated In-Page Iframe App Runner */}
      {hasExecutableUrl && isRunning && (
        <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Ambiente de Execução Ativo
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRunning(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fechar Player
            </Button>
          </div>
          <AppRunner url={it.content_url} title={it.title} />
        </div>
      )}

      {/* Thumbnail or Video Media */}
      {(!isRunning || !hasExecutableUrl) && (it.video_url || it.thumbnail_url) && (
        <div className="mt-10">
          <MediaBlock
            imageUrl={it.thumbnail_url}
            videoUrl={it.video_url}
            transparent={it.transparent_thumbnail}
            fit={it.transparent_thumbnail ? "contain" : "cover"}
            aspect="aspect-video"
          />
        </div>
      )}

      {/* Screenshots Gallery */}
      {gallery.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {isApp ? "Capturas de ecrã" : "Galeria"}
          </h2>
          {active && (
            <img
              src={active}
              alt=""
              className="mb-3 w-full rounded-2xl border border-border shadow-sm"
            />
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(src)}
                className="aspect-video overflow-hidden rounded-xl border border-border transition-all hover:border-foreground/50 hover:shadow-xs"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Release Notes */}
      {it.release_notes && (
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Notas da versão</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
            {it.release_notes}
          </p>
        </div>
      )}

      {/* Markdown Body */}
      {it.body && (
        <article className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{it.body}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
