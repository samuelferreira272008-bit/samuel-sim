import { useEffect, useState } from "react";
import { FileText, Lock, Unlock, Video, Download, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";

const typeIcons: Record<string, any> = {
  article: BookOpen,
  video: Video,
  download: Download,
  course: FileText,
};

export default function Conteudo() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [accessIds, setAccessIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [contentRes, accessRes] = await Promise.all([
        supabase.from("content_items").select("*").order("created_at", { ascending: false }),
        user
          ? supabase.from("user_content_access").select("content_id").eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setItems(contentRes.data ?? []);
      setAccessIds(new Set((accessRes.data ?? []).map((a: any) => a.content_id)));
      setLoading(false);
    }
    load();
  }, [user]);

  const hasAccess = (item: any) => !item.is_premium || accessIds.has(item.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conteúdo</h1>
        <p className="text-muted-foreground">Os teus materiais e recursos disponíveis.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="Sem conteúdo" description="Ainda não há conteúdo disponível." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            const unlocked = hasAccess(item);
            return (
              <Card key={item.id} className={!unlocked ? "opacity-75" : ""}>
                {item.thumbnail_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize gap-1">
                      <Icon className="h-3 w-3" />
                      {item.type}
                    </Badge>
                    {item.is_premium ? (
                      unlocked ? (
                        <Unlock className="h-4 w-4 text-primary" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <Badge variant="secondary">Grátis</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  )}
                  <Button variant={unlocked ? "default" : "secondary"} size="sm" className="w-full" disabled={!unlocked}>
                    {unlocked ? "Aceder" : "Premium"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
