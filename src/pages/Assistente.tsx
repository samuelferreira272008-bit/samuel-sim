import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { askAI, type AiMessage } from "@/lib/ai";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const starters = [
  "Que conteúdos premium recomendas para mim?",
  "Como encontro os meus ficheiros e recibos?",
  "Mostra-me os projetos e ferramentas disponíveis.",
];

export default function Assistente() {
  useSEO({
    title: "Assistente AI | Samuel Simão",
    description: "Assistente interno para responder dúvidas, recomendar conteúdos e ajudar a navegar pela plataforma.",
  });
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMessage: AiMessage = { role: "user", content: clean, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      trackEvent("ai_message_sent", { conversation_id: conversationId ?? null });
      const response = await askAI(clean, conversationId);
      setConversationId(response.conversationId);
      setMessages(response.messages);
      trackEvent("ai_message_completed", {
        conversation_id: response.conversationId,
        tokens: response.usage?.total_tokens ?? null,
      });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m !== userMessage));
      toast({
        title: "Erro no assistente",
        description: e instanceof Error ? e.message : "Não foi possível responder agora.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  const name = profile?.display_name ?? user?.email?.split("@")[0] ?? "Utilizador";

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-5xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Bot className="h-6 w-6 text-primary" /> Assistente AI
          </h1>
          <p className="text-sm text-muted-foreground">Olá, {name}. Faz perguntas sobre conteúdos, projetos, compras e navegação.</p>
        </div>
        <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> Groq</Badge>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-base">Conversa</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center">
              <div className="max-w-xl text-center">
                <Bot className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Como posso ajudar?</h2>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {starters.map((starter) => (
                    <Button key={starter} variant="outline" className="h-auto whitespace-normal text-left" onClick={() => sendMessage(starter)}>
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                  {message.role === "assistant" && <AvatarIcon icon={<Bot className="h-4 w-4" />} />}
                  <div className={cn("max-w-[85%] rounded-lg border border-border px-4 py-3 text-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground")}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && <AvatarIcon icon={<User className="h-4 w-4" />} />}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <AvatarIcon icon={<Bot className="h-4 w-4" />} />
                  <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">A pensar...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Escreve a tua pergunta..."
          maxLength={2000}
          className="min-h-12 resize-none"
        />
        <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-12 w-12 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function AvatarIcon({ icon }: { icon: React.ReactNode }) {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>;
}
