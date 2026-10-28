import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState("");
  const [notifyPosts, setNotifyPosts] = useState(true);
  const [notifyPayments, setNotifyPayments] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone, notify_new_posts, notify_payments")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPhone(data.phone ?? "");
        setNotifyPosts(data.notify_new_posts ?? true);
        setNotifyPayments(data.notify_payments ?? true);
      }
      setLoadingPrefs(false);
    })();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: phone || null,
        notify_new_posts: notifyPosts,
        notify_payments: notifyPayments,
      })
      .eq("user_id", user.id);
    setSavingPrefs(false);
    if (error) toast.error("Erro ao guardar preferências.");
    else toast.success("Preferências guardadas!");
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As passwords não coincidem.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Erro ao alterar password.");
    } else {
      toast.success("Password alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Ajusta as tuas preferências de conta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email
          </CardTitle>
          <CardDescription>O teu endereço de email associado à conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={user?.email ?? ""} disabled className="bg-muted" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Password
          </CardTitle>
          <CardDescription>Escolhe uma password segura com pelo menos 6 caracteres.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={saving || !newPassword}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Alterar Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações & Contacto
          </CardTitle>
          <CardDescription>
            Define que notificações queres receber e o teu telefone (para WhatsApp futuro).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+244 923 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loadingPrefs}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Novos posts no blog</p>
              <p className="text-xs text-muted-foreground">Receber email quando publico conteúdo novo.</p>
            </div>
            <Switch
              checked={notifyPosts}
              onCheckedChange={setNotifyPosts}
              disabled={loadingPrefs}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Atualizações de pagamentos</p>
              <p className="text-xs text-muted-foreground">Notificações de aprovação, pendência ou rejeição.</p>
            </div>
            <Switch
              checked={notifyPayments}
              onCheckedChange={setNotifyPayments}
              disabled={loadingPrefs}
            />
          </div>

          <Button onClick={savePreferences} disabled={savingPrefs || loadingPrefs}>
            {savingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
            Guardar preferências
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>Informações sobre a tua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Conta criada</span>
            <span className="text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-PT") : "—"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Último login</span>
            <span className="text-foreground">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("pt-PT") : "—"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
