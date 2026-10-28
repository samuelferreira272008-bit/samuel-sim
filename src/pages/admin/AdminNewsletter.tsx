import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Sub = {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  unsubscribed_at: string | null;
  created_at: string;
};

export default function AdminNewsletter() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Sub[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const active = rows.filter((r) => !r.unsubscribed_at);
  const churned = rows.filter((r) => r.unsubscribed_at);

  const filtered = rows.filter(
    (r) =>
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const copyEmails = async () => {
    const list = active.map((r) => r.email).join(", ");
    if (!list) {
      toast.error("Sem subscritores ativos.");
      return;
    }
    await navigator.clipboard.writeText(list);
    toast.success(`${active.length} emails copiados para a área de transferência!`);
  };

  const exportCsv = () => {
    if (rows.length === 0) return;
    const header = "email,nome,estado,data_subscricao\n";
    const body = rows
      .map(
        (r) =>
          `"${r.email}","${(r.name ?? "").replace(/"/g, '""')}","${r.unsubscribed_at ? "cancelado" : "ativo"}","${r.created_at}"`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const removeSub = async (id: string) => {
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Subscritor removido.");
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Newsletter</h1>
          <p className="text-muted-foreground">
            {active.length} subscritores ativos · {churned.length} cancelados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyEmails} disabled={active.length === 0}>
            <Copy className="mr-2 h-4 w-4" /> Copiar emails ativos
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <Input
        placeholder="Pesquisar subscritor por email ou nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Ainda sem subscritores.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div>
                  <CardTitle className="text-sm">{r.email}</CardTitle>
                  {r.name && <p className="text-xs text-muted-foreground">{r.name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.unsubscribed_at ? "outline" : "default"}>
                    {r.unsubscribed_at ? "cancelado" : "ativo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), "dd/MM/yyyy")}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => removeSub(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
