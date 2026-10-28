import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, CheckCircle2, Archive, Trash2, Reply, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/repo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
  source?: "table" | "logs";
}

export default function AdminContactos() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "archived">("all");
  const [search, setSearch] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async (): Promise<ContactMsg[]> => {
      const { data, error } = await db
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((m: any) => ({ ...m, source: "table" }));
      }

      // Fallback to system_logs where event_type = 'contact_submitted'
      const { data: logs } = await db
        .from("system_logs")
        .select("*")
        .eq("event_type", "contact_submitted")
        .order("created_at", { ascending: false });

      return (logs ?? []).map((l: any) => {
        const p = l.payload ?? l.metadata ?? {};
        return {
          id: l.id,
          name: p.name ?? "Visitante",
          email: p.email ?? "",
          subject: p.subject ?? "Contacto",
          message: p.message ?? "",
          status: "unread",
          created_at: l.created_at,
          source: "logs",
        };
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "unread" | "read" | "archived" }) => {
      const { error } = await db.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      toast.success("Estado atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMsg = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      toast.success("Mensagem eliminada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shown = messages.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject ?? "").toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <MessageSquare className="h-6 w-6" /> Contactos & Mensagens
          </h1>
          <p className="text-sm text-muted-foreground">
            {messages.length} mensagens recebidas · {unreadCount} por ler
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, email ou assunto..."
          className="max-w-xs"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todas" },
          { key: "unread", label: "Não lidas" },
          { key: "read", label: "Lidas" },
          { key: "archived", label: "Arquivadas" },
        ].map((f) => (
          <Badge
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(f.key as any)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar mensagens...</p>
      ) : shown.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="mx-auto mb-3 h-8 w-8 opacity-40" />
            Nenhuma mensagem encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shown.map((m) => (
            <Card key={m.id} className={m.status === "unread" ? "border-primary/40" : ""}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{m.subject || "Sem assunto"}</h3>
                      <Badge variant={m.status === "unread" ? "default" : "secondary"}>
                        {m.status === "unread" ? "Nova" : m.status === "read" ? "Lida" : "Arquivada"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      De: <span className="font-medium text-foreground">{m.name}</span> ({m.email}) ·{" "}
                      {new Date(m.created_at).toLocaleString("pt-PT")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {m.email && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Contacto"}`)}`}
                          onClick={() => {
                            if (m.source === "table" && m.status === "unread") {
                              updateStatus.mutate({ id: m.id, status: "read" });
                            }
                          }}
                        >
                          <Reply className="mr-1.5 h-3.5 w-3.5" /> Responder
                        </a>
                      </Button>
                    )}
                    {m.source === "table" && m.status !== "read" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Marcar como lida"
                        onClick={() => updateStatus.mutate({ id: m.id, status: "read" })}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {m.source === "table" && m.status !== "archived" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Arquivar"
                        onClick={() => updateStatus.mutate({ id: m.id, status: "archived" })}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    {m.source === "table" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Eliminar"
                        onClick={() => removeMsg.mutate(m.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="whitespace-pre-line rounded-lg bg-muted/50 p-3.5 text-sm text-foreground">
                  {m.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
