import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ExternalLink, Download, X, Upload } from "lucide-react";
import { toast } from "sonner";

interface PostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category_id: string;
  access_level: string;
  video_url: string;
  content_type: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
}

interface LinkItem { title: string; url: string; }
interface ResourceItem { title: string; file: File | null; file_url?: string; }

const emptyForm: PostForm = {
  title: "", slug: "", content: "", excerpt: "", cover_image: "",
  category_id: "", access_level: "public", video_url: "", content_type: "blog", seo_title: "", seo_description: "", published: false,
};

export default function AdminConteudo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories:category_id(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLinks([]);
    setResources([]);
    setDialogOpen(true);
  };

  const openEdit = async (post: any) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      cover_image: post.cover_image || "",
      category_id: post.category_id || "",
      access_level: post.access_level,
      video_url: post.video_url || "",
      content_type: post.content_type || "blog",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      published: post.published,
    });

    const [linksRes, resourcesRes] = await Promise.all([
      supabase.from("post_links").select("*").eq("post_id", post.id),
      supabase.from("post_resources").select("*").eq("post_id", post.id),
    ]);
    setLinks((linksRes.data ?? []).map((l: any) => ({ title: l.title, url: l.url })));
    setResources((resourcesRes.data ?? []).map((r: any) => ({ title: r.title, file: null, file_url: r.file_url })));
    setDialogOpen(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title || !form.slug || !user) {
      toast.error("Título e slug são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const postData = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt || null,
        cover_image: form.cover_image || null,
        category_id: form.category_id || null,
        access_level: form.access_level,
        video_url: form.video_url || null,
        content_type: form.content_type,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        published: form.published,
        author_id: user.id,
      };

      let postId = editingId;

      if (editingId) {
        const { error } = await supabase.from("posts").update(postData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("posts").insert(postData).select("id").single();
        if (error) throw error;
        postId = data.id;
      }

      // Save links
      if (postId) {
        await supabase.from("post_links").delete().eq("post_id", postId);
        if (links.length > 0) {
          await supabase.from("post_links").insert(
            links.filter(l => l.title && l.url).map(l => ({ post_id: postId!, title: l.title, url: l.url }))
          );
        }

        // Upload resources
        await supabase.from("post_resources").delete().eq("post_id", postId);
        for (const res of resources) {
          let fileUrl = res.file_url || "";
          if (res.file) {
            const path = `${postId}/${Date.now()}-${res.file.name}`;
            const { error: uploadError } = await supabase.storage.from("post-resources").upload(path, res.file);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from("post-resources").getPublicUrl(path);
            fileUrl = urlData.publicUrl;
          }
          if (fileUrl && res.title) {
            await supabase.from("post_resources").insert({ post_id: postId!, title: res.title, file_url: fileUrl });
          }
        }
      }

      toast.success(editingId ? "Post atualizado!" : "Post criado!");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post eliminado.");
    },
    onError: () => toast.error("Erro ao eliminar."),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Conteúdo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Criar e gerir blog, tutoriais e conteúdo do Lab.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Post
        </Button>
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : posts.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Nenhum post criado ainda.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{post.title}</h3>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Publicado" : "Rascunho"}
                    </Badge>
                    <Badge variant="outline">{post.content_type ?? "blog"}</Badge>
                    {post.categories?.name && <Badge variant="outline">{post.categories.name}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    /{post.slug} · {new Date(post.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Eliminar"
                    onClick={() => deletePost.mutate(post.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Post" : "Novo Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value, slug: editingId ? f.slug : generateSlug(e.target.value) })); }}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Excerto</Label>
                <Input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
              </div>
              <div>
                <Label>Tipo de conteúdo</Label>
                <Select value={form.content_type} onValueChange={v => setForm(f => ({ ...f, content_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>SEO title</Label>
                <Input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} maxLength={60} />
              </div>
              <div>
                <Label>SEO description</Label>
                <Input value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} maxLength={160} />
              </div>
            </div>

            <div>
              <Label>Conteúdo (Markdown)</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-sm" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Imagem de Capa</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.cover_image}
                    onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                    placeholder="URL ou carrega ficheiro"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    className="max-w-[160px]"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const path = `covers/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
                        const { error } = await supabase.storage.from("post-resources").upload(path, file, { contentType: file.type });
                        if (error) throw error;
                        const { data } = supabase.storage.from("post-resources").getPublicUrl(path);
                        setForm(f => ({ ...f, cover_image: data.publicUrl }));
                        toast.success("Imagem carregada.");
                      } catch (err: any) {
                        console.error("Cover upload failed:", err);
                        toast.error(err.message || "Falha no upload da imagem.");
                      } finally {
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
                {form.cover_image && (
                  <img src={form.cover_image} alt="capa" className="mt-2 h-24 w-full rounded border border-border object-cover" />
                )}
              </div>
              <div>
                <Label>Vídeo (URL)</Label>
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="youtube.com/watch?v=..." />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Categoria</Label>
                <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nível de Acesso</Label>
                <Select value={form.access_level} onValueChange={v => setForm(f => ({ ...f, access_level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="restricted">Restrito</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} id="published" />
                <Label htmlFor="published">Publicado</Label>
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="flex items-center gap-1"><ExternalLink className="h-4 w-4" /> Links</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setLinks(l => [...l, { title: "", url: "" }])}>
                  <Plus className="mr-1 h-3 w-3" /> Adicionar
                </Button>
              </div>
              {links.map((link, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <Input placeholder="Título" value={link.title} onChange={e => { const n = [...links]; n[i].title = e.target.value; setLinks(n); }} />
                  <Input placeholder="URL" value={link.url} onChange={e => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }} />
                  <Button variant="ghost" size="icon" onClick={() => setLinks(l => l.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="flex items-center gap-1"><Download className="h-4 w-4" /> Recursos</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setResources(r => [...r, { title: "", file: null }])}>
                  <Plus className="mr-1 h-3 w-3" /> Adicionar
                </Button>
              </div>
              {resources.map((res, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <Input placeholder="Título" value={res.title} onChange={e => { const n = [...resources]; n[i].title = e.target.value; setResources(n); }} />
                  <Input
                    type="file"
                    onChange={e => { const n = [...resources]; n[i].file = e.target.files?.[0] ?? null; setResources(n); }}
                  />
                  {res.file_url && <span className="text-xs text-muted-foreground">✓</span>}
                  <Button variant="ghost" size="icon" onClick={() => setResources(r => r.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "A guardar..." : editingId ? "Atualizar" : "Criar Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
