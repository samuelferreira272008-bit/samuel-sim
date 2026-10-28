import { useEffect, useState } from "react";
import { ShoppingBag, FileText, Award, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ purchases: 0, content: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [purchasesRes, contentRes, certsRes, recentRes] = await Promise.all([
        supabase.from("purchases").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("user_content_access").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("certificates").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("purchases").select("id, amount, status, created_at, products(name)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        purchases: purchasesRes.count ?? 0,
        content: contentRes.count ?? 0,
        certificates: certsRes.count ?? 0,
      });
      setRecentPurchases(recentRes.data ?? []);
      setLoading(false);
    }

    load();
  }, [user]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Utilizador";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {displayName} 👋
        </h1>
        <p className="text-muted-foreground">Bem-vindo ao teu painel de controlo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Compras" value={stats.purchases} icon={ShoppingBag} loading={loading} description="Total de compras realizadas" />
        <StatCard title="Conteúdo" value={stats.content} icon={FileText} loading={loading} description="Conteúdos disponíveis" />
        <StatCard title="Certificados" value={stats.certificates} icon={Award} loading={loading} description="Certificados obtidos" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : recentPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem atividade recente.</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{(p.products as any)?.name ?? "Produto"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">€{Number(p.amount).toFixed(2)}</span>
                    <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                      {p.status === "completed" ? "Concluída" : p.status === "pending" ? "Pendente" : "Reembolsada"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
