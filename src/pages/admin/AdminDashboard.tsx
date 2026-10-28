import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Activity, Bell, CreditCard, FileText, Settings, ShieldCheck, Tag, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminDashboardStats } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const db = supabase as any;

const quickActions = [
  { label: "Novo conteúdo", to: "/admin/conteudo", icon: FileText },
  { label: "Gerir membros", to: "/admin/membros", icon: Users },
  { label: "Rever pagamentos", to: "/admin/manual-payments", icon: CreditCard },
  { label: "Enviar alerta", to: "/admin/notificacoes", icon: Bell },
  { label: "Definições", to: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-dashboard-stats"], queryFn: getAdminDashboardStats });
  const { data: logs = [] } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: async () => {
      const { data, error } = await db.from("system_logs").select("*").order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Centro de Operações</h1>
        <p className="text-sm text-muted-foreground">Controlo central de utilizadores, receita, pagamentos e automações.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<Users className="h-4 w-4" />} label="Total users" value={stats?.totalUsers} loading={isLoading} />
        <MetricCard icon={<ShieldCheck className="h-4 w-4" />} label="Users ativos" value={stats?.activeUsers} loading={isLoading} />
        <MetricCard icon={<CreditCard className="h-4 w-4" />} label="Receita total" value={`${(stats?.revenue ?? 0).toLocaleString("pt-PT")} Kz`} loading={isLoading} />
        <MetricCard icon={<Activity className="h-4 w-4" />} label="Pendentes" value={stats?.payments.pending} loading={isLoading} />
        <MetricCard icon={<Tag className="h-4 w-4" />} label="Aprov./Rej." value={`${stats?.payments.approved ?? 0}/${stats?.payments.rejected ?? 0}`} loading={isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem atividade registada.</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{log.action ?? log.event_type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-PT")}</p>
                  </div>
                  <Badge variant={log.status === "failed" ? "destructive" : "outline"}>{log.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => (
              <Button key={action.to} asChild variant="outline" className="justify-start gap-2">
                <Link to={action.to}><action.icon className="h-4 w-4" />{action.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, loading }: { icon: ReactNode; label: string; value?: ReactNode; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">{icon}</div>
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>}
      </CardContent>
    </Card>
  );
}
