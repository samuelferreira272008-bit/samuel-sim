import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CreditCard, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { db, formatPrice } from "@/lib/repo";
import { SegmentedControl } from "@/components/visuals/SegmentedControl";
import { GlowCard } from "@/components/visuals/GlowCard";
import { CURATED_PRODUCTS } from "@/lib/curatedContent";

const filters = [
  { value: "all", label: "Todos" },
  { value: "digital", label: "Digitais & Serviços" },
  { value: "template", label: "Templates" },
  { value: "ebook", label: "E-books" },
  { value: "physical", label: "Físicos" },
];

const typeLabel: Record<string, string> = {
  physical: "Físico",
  digital: "Digital",
  template: "Template",
  ebook: "E-book",
  course: "Curso",
};

interface ProductEntry {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  type: string;
  image_url?: string | null;
  created_at?: string;
}

export default function Produtos() {
  useSEO({
    title: "Produtos — Samuel Simão",
    description: "Vitrine de produtos digitais, templates, consultoria e soluções práticas com pagamento via Multicaixa, BAI Direto e PayPal.",
  });
  const [filter, setFilter] = useState("all");

  const { data: dbProducts = [], isLoading } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () =>
      (await db.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false })).data ?? [],
  });

  const products = useMemo(() => {
    const combined = [...(dbProducts as ProductEntry[]), ...CURATED_PRODUCTS];
    const seen = new Set<string>();
    return combined.filter((p) => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dbProducts]);

  const shown = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "digital") return p.type === "digital" || p.type === "course";
    return p.type === filter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Vitrine</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Produtos & Serviços</h1>
      <p className="mt-2 text-base sm:text-lg text-muted-foreground">
        Soluções digitais, templates e consultoria construídas por mim. Aceito Multicaixa Express, BAI Direto e PayPal.
      </p>

      <div className="mb-8 mt-6 overflow-x-auto pb-1">
        <SegmentedControl
          name="products-filter"
          options={filters}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sem produtos encontrados"
          description="Brevemente disponibilizarei novos itens nesta categoria da vitrine."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((p) => (
            <GlowCard key={p.id} enableTilt={true} className="flex flex-col justify-between overflow-hidden">
              <Link to={`/produtos/${p.id}`} className="group flex flex-1 flex-col justify-between">
                <div>
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/60" />
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5">
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/85 font-medium text-xs">
                        {typeLabel[p.type] ?? "Digital"}
                      </Badge>
                    </span>
                  </div>
                  <div className="space-y-2 p-4 sm:p-5">
                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {formatPrice(p.price, p.currency ?? "AOA")}
                    </p>
                    <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <CreditCard className="h-3 w-3" /> Multicaixa · BAI · PayPal
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}
