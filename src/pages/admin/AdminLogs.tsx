import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { format } from "date-fns";

type LogRow = {
  id: string;
  event_type: string;
  status: string;
  payload: any;
  error_message: string | null;
  created_at: string;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  processing: "secondary",
  queued: "outline",
  pending: "outline",
  failed: "destructive",
};

export default function AdminLogs() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data ?? []) as LogRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const replay = async (row: LogRow) => {
    setWorking(row.id);
    await supabase.functions.invoke("dispatch-event", {
      body: {
        event_type: row.event_type,
        payload: row.payload,
        log_id: row.id,
      },
    });
    setWorking(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Logs</h1>
          <p className="text-muted-foreground">
            Eventos automáticos disparados pelo sistema (emails, webhooks, etc.)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sem eventos registados ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <code className="text-sm font-mono">{r.event_type}</code>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>
                      {r.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), "dd/MM/yyyy HH:mm:ss")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => replay(r)}
                  disabled={working === r.id}
                >
                  {working === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Reenviar
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Ver payload
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-muted p-3 font-mono text-foreground">
                    {JSON.stringify(r.payload, null, 2)}
                  </pre>
                </details>
                {r.error_message && (
                  <p className="mt-2 text-xs text-destructive">
                    Erro: {r.error_message}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
