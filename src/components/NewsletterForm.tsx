import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToNewsletter } from "@/lib/newsletter";

export function NewsletterForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await subscribeToNewsletter({
      email,
      name: name || undefined,
      user_id: user?.id,
    });
    setLoading(false);
    if (!r.ok) {
      toast.error(r.error ?? "Erro ao subscrever.");
      return;
    }
    setDone(true);
    toast.success("Subscrição confirmada! Verifica o teu email.");
  };

  if (done) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3 py-6">
          <Mail className="h-5 w-5 text-primary" />
          <p className="text-sm text-foreground">
            Obrigado! Vais receber as próximas novidades por email.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Nome (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          required
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        Subscrever newsletter
      </Button>
    </form>
  );
}
