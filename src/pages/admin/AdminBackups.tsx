import { useEffect, useState } from "react";
import { Archive, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

type Backup = { id: string; label: string; scope: string; status: string; created_at: string; restored_at: string | null };

async function callBackup(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("platform-backup", { body: { action, ...body } });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function AdminBackups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  async function loadBackups() {
    setLoading(true);
    try {
      const data = await callBackup("list");
      setBackups(data.backups ?? []);
    } catch (e) {
      toast({ title: "Erro ao carregar backups", description: e instanceof Error ? e.message : "Falhou", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBackups(); }, []);

  async function createBackup() {
    setWorking(true);
    try {
      await callBackup("create", { label: label || undefined });
      setLabel("");
      await loadBackups();
      toast({ title: "Backup criado" });
    } catch (e) {
      toast({ title: "Erro ao criar backup", description: e instanceof Error ? e.message : "Falhou", variant: "destructive" });
    } finally {
      setWorking(false);
    }
  }

  async function restoreBackup(backupId: string) {
    setWorking(true);
    try {
      await callBackup("restore", { backupId });
      await loadBackups();
      toast({ title: "Backup restaurado" });
    } catch (e) {
      toast({ title: "Erro ao restaurar", description: e instanceof Error ? e.message : "Falhou", variant: "destructive" });
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Archive className="h-6 w-6 text-primary" /> Backups</h1>
          <p className="text-sm text-muted-foreground">Snapshots internos de conteúdos, produtos, projetos e recursos.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadBackups} disabled={loading}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> Criar snapshot</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nome do backup" maxLength={120} />
          <Button onClick={createBackup} disabled={working}>Criar backup</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Backups recentes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : backups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem backups criados.</p>
          ) : (
            <ul className="space-y-2">
              {backups.map((backup) => (
                <li key={backup.id} className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{backup.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(backup.created_at).toLocaleString("pt-PT")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={backup.status === "restored" ? "default" : "secondary"}>{backup.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => restoreBackup(backup.id)} disabled={working}>
                      <RotateCcw className="h-4 w-4" /> Restaurar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
