import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageCircle, Send, Hash, MessagesSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useSEO } from "@/lib/seo";

const db = supabase as any;

export default function Comunidade() {
  useSEO({
    title: "Comunidade — Samuel Simão",
    description: "Junta-te à comunidade no WhatsApp, Telegram e Discord. Participa nas discussões.",
  });

  const { data: settings } = useQuery({
    queryKey: ["platform_settings_public"],
    queryFn: async () => {
      const { data } = await db
        .from("platform_settings")
        .select("community_whatsapp,community_telegram,community_discord")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: recent = [], isLoading } = useQuery({
    queryKey: ["recent_comments"],
    queryFn: async () => {
      const { data } = await db
        .from("comments")
        .select("id,content,created_at,post_id")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!data?.length) return [];
      const ids = data.map((c: any) => c.post_id);
      const { data: posts } = await db.from("posts").select("id,title,slug").in("id", ids);
      return data.map((c: any) => ({
        ...c,
        post: posts?.find((p: any) => p.id === c.post_id),
      }));
    },
  });

  const channels = [
    { name: "WhatsApp", url: settings?.community_whatsapp, icon: MessageCircle, color: "text-green-600" },
    { name: "Telegram", url: settings?.community_telegram, icon: Send, color: "text-sky-500" },
    { name: "Discord", url: settings?.community_discord, icon: Hash, color: "text-indigo-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground">Comunidade</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Conecta-te com outras pessoas que partilham os mesmos interesses.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Canais</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {channels.map((ch) => (
            <Card key={ch.name} className={!ch.url ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ch.icon className={`h-5 w-5 ${ch.color}`} />
                  <CardTitle className="text-base">{ch.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {ch.url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={ch.url} target="_blank" rel="noopener noreferrer">Entrar</a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Em breve.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Newsletter</h2>
        <NewsletterForm />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Últimas discussões</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : recent.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <MessagesSquare className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Ainda sem comentários. Sê o primeiro a participar!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recent.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <p className="text-sm text-foreground line-clamp-2">{c.content}</p>
                  {c.post && (
                    <Link to={`/blog/${c.post.slug}`} className="mt-2 inline-block text-xs text-primary hover:underline">
                      em: {c.post.title}
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
