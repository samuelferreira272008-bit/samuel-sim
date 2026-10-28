import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ExternalLink, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MediaBlock } from "@/components/media/MediaBlock";
import { useSEO } from "@/lib/seo";

const db = supabase as any;

export default function Empresas() {
  useSEO({
    title: "Empresas — Samuel Simão",
    description: "Negócios, marcas e organizações apresentadas: missão, visão, produtos e projetos.",
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["businesses-public"],
    queryFn: async () => {
      const { data, error } = await db
        .from("businesses")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="relative overflow-hidden bg-mesh">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Portfolio</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Empresas
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Negócios e marcas que apresento — com missão, visão, produtos e projetos vinculados.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
          </div>
        ) : businesses.length === 0 ? (
          <EmptyState icon={Building2} title="Sem empresas publicadas" description="Em breve serão apresentadas aqui." />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b: any, i: number) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link to={`/empresas/${b.slug}`}>
                  <Card className="group h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
                    <MediaBlock
                      imageUrl={b.cover_url ?? b.logo_url}
                      transparent={!b.cover_url && !!b.logo_url}
                      fit={!b.cover_url && !!b.logo_url ? "contain" : "cover"}
                      aspect="aspect-video"
                      rounded={false}
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        {b.logo_url && (
                          <img src={b.logo_url} alt="" className="h-10 w-10 rounded-lg border border-border/60 bg-checker object-contain p-1" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground">{b.name}</h3>
                      </div>
                      {b.tagline && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{b.tagline}</p>
                      )}
                      <div className="mt-5 inline-flex items-center text-sm font-medium text-foreground">
                        Conhecer <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
