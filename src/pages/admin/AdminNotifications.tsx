import { useEffect, useState } from "react";
import { Bell, Radio, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { broadcastNotification } from "@/lib/admin";
import { createAdminNotification } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProfileOption = { user_id: string; display_name: string | null };

export default function AdminNotifications() {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id, display_name")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProfiles((data ?? []) as ProfileOption[]));
  }, []);

  const send = async () => {
    if (!target || !title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await createAdminNotification({ user_id: target, title: title.trim(), message: message.trim(), type: "system" });
      toast.success("Notificação enviada.");
      setTitle("");
      setMessage("");
    } catch (error: any) {
      toast.error(error.message ?? "Não foi possível enviar.");
    } finally {
      setSending(false);
    }
  };

  const broadcast = async () => {
    if (!title.trim() || !message.trim()) return;
    setBroadcasting(true);
    try {
      const result = await broadcastNotification({ title: title.trim(), message: message.trim(), type: "system" }) as { count?: number };
      toast.success(`Broadcast enviado para ${result.count ?? 0} utilizadores.`);
      setTitle("");
      setMessage("");
    } catch (error: any) {
      toast.error(error.message ?? "Não foi possível enviar broadcast.");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
        <p className="text-muted-foreground">Envia mensagens internas e acompanha alertas automáticos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5" /> Mensagem administrativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger><SelectValue placeholder="Escolher utilizador" /></SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>{profile.display_name ?? profile.user_id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Atualização do sistema" />
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreve a mensagem..." />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={send} disabled={sending || !target || !title.trim() || !message.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Enviar notificação
            </Button>
            <Button variant="outline" onClick={broadcast} disabled={broadcasting || !title.trim() || !message.trim()}>
              <Radio className="mr-2 h-4 w-4" />
              Broadcast para ativos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
