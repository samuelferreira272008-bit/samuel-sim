import { useEffect, useMemo, useState } from "react";
import { Bot, MessageSquare, RefreshCw, Save, ToggleLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type AiSettings = { id: string; enabled: boolean; instructions: string; max_context_items: number };
type UsageEvent = { id: string; tokens_used: number; model: string | null; created_at: string };
type Conversation = { id: string; user_id: string; messages: unknown[]; created_at: string };

export default function AdminAI() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [usage, setUsage] = useState<UsageEvent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    const [settingsRes, usageRes, conversationsRes] = await Promise.all([
      supabase.from("ai_settings" as never).select("*" as never).limit(1).maybeSingle(),
      supabase.from("ai_usage_events" as never).select("id,tokens_used,model,created_at" as never).order("created_at" as never, { ascending: false }).limit(100),
      supabase.from("ai_conversations" as never).select("id,user_id,messages,created_at" as never).order("created_at" as never, { ascending: false }).limit(20),
    ]);
    setSettings((settingsRes.data as unknown as AiSettings) ?? null);
    setUsage((usageRes.data as unknown as UsageEvent[]) ?? []);
    setConversations((conversationsRes.data as unknown as Conversation[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => ({
    requests: usage.length,
    tokens: usage.reduce((sum, item) => sum + Number(item.tokens_used ?? 0), 0),
    conversations: conversations.length,
  }), [usage, conversations]);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("ai_settings" as never)
      .update({ enabled: settings.enabled, instructions: settings.instructions, max_context_items: settings.max_context_items } as never)
      .eq("id" as never, settings.id as never);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao guardar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Definições guardadas" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Bot className="h-6 w-6 text-primary" /> Assistente AI</h1>
          <p className="text-sm text-muted-foreground">Controlo interno, instruções e uso do assistente Groq.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric title="Pedidos" value={totals.requests} loading={loading} />
        <Metric title="Tokens usados" value={totals.tokens} loading={loading} />
        <Metric title="Conversas recentes" value={totals.conversations} loading={loading} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Definições</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {loading || !settings ? <Skeleton className="h-40 w-full" /> : (
            <>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="flex items-center gap-2"><ToggleLeft className="h-4 w-4" /> Ativar assistente</Label>
                  <p className="text-xs text-muted-foreground">Quando desligado, a função recusa novas mensagens.</p>
                </div>
                <Switch checked={settings.enabled} onCheckedChange={(enabled) => setSettings({ ...settings, enabled })} />
              </div>
              <div className="space-y-2">
                <Label>Instruções do sistema</Label>
                <Textarea value={settings.instructions} maxLength={3000} onChange={(e) => setSettings({ ...settings, instructions: e.target.value })} className="min-h-32" />
              </div>
              <Button onClick={saveSettings} disabled={saving}><Save className="h-4 w-4" /> Guardar</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Conversas recentes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem conversas ainda.</p>
          ) : (
            <ul className="space-y-2">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{conversation.id}</p>
                    <p className="text-xs text-muted-foreground">{new Date(conversation.created_at).toLocaleString("pt-PT")}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1"><MessageSquare className="h-3 w-3" /> {Array.isArray(conversation.messages) ? conversation.messages.length : 0}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, loading }: { title: string; value: number; loading: boolean }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{title}</p>{loading ? <Skeleton className="mt-2 h-7 w-20" /> : <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>}</CardContent></Card>;
}
