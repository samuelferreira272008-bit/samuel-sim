import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { db, formatPrice } from "@/lib/repo";
import { SegmentedControl } from "@/components/visuals/SegmentedControl";

const filters = [
  { value: "all", label: "Todos" },
  { value: "physical", label: "Físicos" },
  { value: "digital", label: "Digitais" },
];

export default function Produtos() {
  useSEO({ title: "Produtos — Samuel Simão", description: "Vitrine de produtos físicos e digitais." });
  const [filter, setFilter] = useState("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => (await db.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false })).data ?? [],
  });

  const shown = products.filter((p: any) =>
    filter === "all" ? true : filter === "physical" ? p.type === "physical" : p.type !== "physical",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Vitrine</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Produtos</h1>
      <p className="mt-2 text-base sm:text-lg text-muted-foreground">Produtos físicos e digitais com acabamento de alta qualidade.</p>

      <div className="mb-8 mt-6">
        <SegmentedControl
          name="products-filter"
          options={filters}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>
      ) : shown.length === 0 ? (
        <EmptyState icon={Package} title="Sem produtos encontrados" description="Em breve novos produtos nesta categoria da vitrine." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((p: any) => (
            <div key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm">
              <Link to={`/produtos/${p.id}`} className="block flex-1">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-muted-foreground/60" /></div>
                  )}
                  <span className="absolute top-2.5 right-2.5">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-medium text-xs">
                      {p.type === "physical" ? "Físico" : "Digital"}
                    </Badge>
                  </span>
                </div>
                <div className="space-y-1.5 p-4 sm:p-5">
                  <h3 className="font-bold text-foreground text-base group-hover:text-foreground/90 transition-colors line-clamp-1">{p.name}</h3>
                  <p className="font-semibold text-foreground text-sm">{formatPrice(p.price, p.currency ?? "AOA")}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
