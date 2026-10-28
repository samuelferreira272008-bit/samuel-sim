import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles:user_id(display_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user || !content.trim()) return;
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comentário adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar comentário."),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comentário removido.");
    },
  });

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
        <MessageCircle className="h-5 w-5" />
        Comentários ({comments.length})
      </h3>

      {user ? (
        <div className="mb-8 space-y-3">
          <Textarea
            placeholder="Escreve o teu comentário..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button
            onClick={() => addComment.mutate()}
            disabled={!content.trim() || addComment.isPending}
            size="sm"
          >
            {addComment.isPending ? "A enviar..." : "Comentar"}
          </Button>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          <a href="/login" className="text-primary underline">Inicia sessão</a> para comentar.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda sem comentários. Sê o primeiro!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3 rounded-lg bg-muted/50 p-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {(comment.profiles?.display_name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {comment.profiles?.display_name || "Utilizador"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("pt-PT")}
                    </span>
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteComment.mutate(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/80">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
