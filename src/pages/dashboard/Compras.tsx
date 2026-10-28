import { useEffect, useState } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  completed: { label: "Concluída", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  refunded: { label: "Reembolsada", variant: "destructive" },
};

export default function Compras() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("purchases")
      .select("*, products(name, description, type)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPurchases(data ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compras</h1>
        <p className="text-muted-foreground">Histórico das tuas compras.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : purchases.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Sem compras" description="Ainda não realizaste nenhuma compra." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todas as compras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {purchases.map((p) => {
              const s = statusMap[p.status] ?? statusMap.pending;
              const product = p.products as any;
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{product?.name ?? "Produto"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-PT")} · {product?.type ?? "digital"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">€{Number(p.amount).toFixed(2)}</span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                    {p.status === "completed" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
