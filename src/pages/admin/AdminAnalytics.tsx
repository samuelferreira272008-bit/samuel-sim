import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { aggregateDailyMetrics } from "@/lib/analytics";
import { toast } from "@/hooks/use-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, DollarSign, Eye, RefreshCw, TrendingUp, Users } from "lucide-react";

interface DailyMetric {
  date: string;
  total_users: number;
  new_users: number;
  total_sales: number;
  revenue: number;
  page_views: number;
  unique_visitors: number;
}

interface PageStat {
  page: string;
  views: number;
}

interface ProductStat {
  name: string;
  sales: number;
  revenue: number;
}

interface Totals {
  newUsers7d: number;
  newUsersToday: number;
  revenue7d: number;
  sales7d: number;
  pageViews7d: number;
  uniqueVisitors7d: number;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [topPages, setTopPages] = useState<PageStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [totals, setTotals] = useState<Totals>({
    newUsers7d: 0,
    newUsersToday: 0,
    revenue7d: 0,
    sales7d: 0,
    pageViews7d: 0,
    uniqueVisitors7d: 0,
  });

  async function loadData() {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceISO = since.toISOString();
    const since7 = new Date();
    since7.setDate(since7.getDate() - 7);
    const since7ISO = since7.toISOString();
    const todayISO = new Date().toISOString().slice(0, 10);

    const [metricsRes, eventsRes, purchasesRes, productsRes] = await Promise.all([
      supabase
        .from("daily_metrics")
        .select("*")
        .gte("date", since.toISOString().slice(0, 10))
        .order("date", { ascending: true }),
      supabase
        .from("analytics_events")
        .select("page, user_id, session_id, event_type, created_at")
        .gte("created_at", since7ISO)
        .limit(1000),
      supabase
        .from("purchases")
        .select("amount, product_id, status, created_at")
        .eq("status", "completed")
        .gte("created_at", since7ISO)
        .limit(1000),
      supabase.from("products").select("id, name"),
    ]);

    if (metricsRes.data) setMetrics(metricsRes.data as DailyMetric[]);

    // Top pages
    const pageCounts = new Map<string, number>();
    let pageViews = 0;
    const visitors = new Set<string>();
    let newUsersToday = 0;
    (eventsRes.data ?? []).forEach((e) => {
      if (e.event_type === "page_view") {
        pageViews++;
        if (e.page) pageCounts.set(e.page, (pageCounts.get(e.page) ?? 0) + 1);
      }
      visitors.add(e.user_id ?? e.session_id ?? "anon");
      if (e.event_type === "user_registered" && e.created_at?.slice(0, 10) === todayISO) {
        newUsersToday++;
      }
    });
    const pages = Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
    setTopPages(pages);

    // Top products
    const productMap = new Map(
      (productsRes.data ?? []).map((p) => [p.id as string, p.name as string]),
    );
    const productAgg = new Map<string, { sales: number; revenue: number }>();
    let revenue7d = 0;
    let sales7d = 0;
    (purchasesRes.data ?? []).forEach((p) => {
      const name = productMap.get(p.product_id) ?? "Unknown";
      const cur = productAgg.get(name) ?? { sales: 0, revenue: 0 };
      cur.sales += 1;
      cur.revenue += Number(p.amount);
      productAgg.set(name, cur);
      revenue7d += Number(p.amount);
      sales7d += 1;
    });
    const products = Array.from(productAgg.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    setTopProducts(products);

    // 7d new users from auth (use metrics if available, else estimate)
    const last7Metrics = (metricsRes.data ?? []).slice(-7);
    const newUsers7d = last7Metrics.reduce((s, m) => s + (m.new_users ?? 0), 0);

    setTotals({
      newUsers7d,
      newUsersToday,
      revenue7d,
      sales7d,
      pageViews7d: pageViews,
      uniqueVisitors7d: visitors.size,
    });
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await aggregateDailyMetrics();
      await loadData();
      toast({ title: "Métricas atualizadas" });
    } catch (e) {
      toast({
        title: "Erro ao agregar",
        description: e instanceof Error ? e.message : "Falhou",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }

  const chartData = useMemo(
    () =>
      metrics.map((m) => ({
        date: m.date.slice(5),
        revenue: Number(m.revenue),
        sales: m.total_sales,
        views: m.page_views,
        new_users: m.new_users,
      })),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Métricas internas dos últimos 30 dias.</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="ml-2">Agregar hoje</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Novos users (hoje)"
          value={totals.newUsersToday}
          loading={loading}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Novos users (7d)"
          value={totals.newUsers7d}
          loading={loading}
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Receita (7d)"
          value={`${totals.revenue7d.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} Kz`}
          loading={loading}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Vendas (7d)"
          value={totals.sales7d}
          loading={loading}
        />
        <StatCard
          icon={<Eye className="h-4 w-4" />}
          label="Page views (7d)"
          value={totals.pageViews7d}
          loading={loading}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Visitantes únicos (7d)"
          value={totals.uniqueVisitors7d}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita ao longo do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <EmptyChart text="Sem dados ainda. Clica em 'Agregar hoje'." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Page views diárias</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <EmptyChart text="Sem dados." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Páginas mais vistas (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados de page views.</p>
            ) : (
              <ul className="space-y-2">
                {topPages.map((p) => (
                  <li
                    key={p.page}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate text-foreground">{p.page}</span>
                    <Badge variant="secondary">{p.views}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos mais vendidos (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem vendas no período.</p>
            ) : (
              <ul className="space-y-2">
                {topProducts.map((p) => (
                  <li
                    key={p.name}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sales} vendas</p>
                    </div>
                    <span className="font-mono text-sm">
                      {p.revenue.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} Kz
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-20" />
        ) : (
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
