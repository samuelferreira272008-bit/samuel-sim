import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useSEO } from "@/lib/seo";
import { db, formatPrice } from "@/lib/repo";

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
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Vitrine</p>
      <h1 className="mt-2 text-4xl font-bold text-foreground">Produtos</h1>
      <p className="mt-2 text-lg text-muted-foreground">Produtos físicos e digitais.</p>

      <div className="mb-8 mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Badge key={f.value} variant={filter === f.value ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilter(f.value)}>
            {f.label}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
      ) : shown.length === 0 ? (
        <EmptyState icon={Package} title="Sem produtos" description="Em breve novos produtos na vitrine." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((p: any) => (
            <Link key={p.id} to={`/produtos/${p.id}`} className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="aspect-square overflow-hidden bg-muted">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-muted-foreground" /></div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <Badge variant="secondary">{p.type === "physical" ? "Físico" : "Digital"}</Badge>
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <p className="font-bold text-foreground">{formatPrice(p.price, p.currency ?? "AOA")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
