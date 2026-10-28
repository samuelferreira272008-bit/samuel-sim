import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Target, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaBlock } from "@/components/media/MediaBlock";
import { useSEO } from "@/lib/seo";

const db = supabase as any;

export default function EmpresaDetail() {
  const { slug } = useParams();

  const { data: business, isLoading } = useQuery({
    queryKey: ["business-detail", slug],
    queryFn: async () => {
      const { data } = await db.from("businesses").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  const { data: links = [] } = useQuery({
    queryKey: ["business-links", business?.id],
    queryFn: async () => {
      const { data } = await db
        .from("business_links")
        .select("*, content_items:content_item_id(id,title,description,type,thumbnail_url,content_url), products:product_id(id,name,description,image_url,price)")
        .eq("business_id", business.id)
        .order("sort_order");
      return data ?? [];
    },
    enabled: !!business?.id,
  });

  useSEO({
    title: business ? `${business.name} — Empresas` : "Empresa — Samuel Simão",
    description: business?.tagline ?? business?.description ?? undefined,
    image: business?.cover_url ?? business?.logo_url ?? null,
    jsonLd: business
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: business.name,
          description: business.tagline ?? business.description ?? "",
          url: business.website ?? undefined,
          logo: business.logo_url ?? undefined,
        }
      : undefined,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-5xl p-8 space-y-6"><Skeleton className="h-72 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }
  if (!business) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-muted-foreground">Empresa não encontrada.</p>
        <Button asChild variant="outline" className="mt-6"><Link to="/empresas"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link></Button>
      </div>
    );
  }

  const contentLinks = links.filter((l: any) => l.content_items);
  const productLinks = links.filter((l: any) => l.products);

  return (
    <div className="bg-mesh">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/empresas"><ArrowLeft className="mr-2 h-4 w-4" />Empresas</Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="grid gap-10 lg:grid-cols-[1.3fr_1fr]"
        >
          <div>
            {(business.cover_url || business.video_url) && (
              <MediaBlock
                imageUrl={business.cover_url}
                videoUrl={business.video_url}
                aspect="aspect-video"
                className="mb-8"
              />
            )}
            <div className="flex items-center gap-4">
              {business.logo_url && (
                <img src={business.logo_url} alt="" className="h-16 w-16 rounded-xl border border-border bg-checker object-contain p-1" />
              )}
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{business.name}</h1>
                {business.tagline && <p className="mt-1 text-lg text-muted-foreground">{business.tagline}</p>}
              </div>
            </div>
            {business.description && (
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{business.description}</p>
            )}
            {business.website && (
              <Button asChild variant="outline" className="mt-6">
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  Visitar site <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {business.mission && (
              <Card><CardContent className="p-6">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                  <Target className="h-4 w-4" /> Missão
                </div>
                <p className="text-muted-foreground whitespace-pre-line">{business.mission}</p>
              </CardContent></Card>
            )}
            {business.vision && (
              <Card><CardContent className="p-6">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                  <Eye className="h-4 w-4" /> Visão
                </div>
                <p className="text-muted-foreground whitespace-pre-line">{business.vision}</p>
              </CardContent></Card>
            )}
          </div>
        </motion.div>

        {contentLinks.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Projetos & Ferramentas</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contentLinks.map((l: any) => {
                const c = l.content_items;
                return (
                  <Card key={l.id} className="overflow-hidden">
                    {c.thumbnail_url && <MediaBlock imageUrl={c.thumbnail_url} aspect="aspect-video" rounded={false} />}
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-2">{c.type}</Badge>
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      {c.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                      {c.content_url && (
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <a href={c.content_url} target="_blank" rel="noreferrer">Abrir <ExternalLink className="ml-1 h-3 w-3" /></a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {productLinks.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Produtos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productLinks.map((l: any) => {
                const p = l.products;
                return (
                  <Card key={l.id} className="overflow-hidden">
                    {p.image_url && <MediaBlock imageUrl={p.image_url} aspect="aspect-video" rounded={false} />}
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      {p.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                      <p className="mt-2 font-bold">{Number(p.price ?? 0).toLocaleString("pt-PT")} Kz</p>
                      <Button asChild size="sm" className="mt-3"><Link to={`/produtos/${p.id}`}>Ver produto</Link></Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
