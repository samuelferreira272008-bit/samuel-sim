import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Boxes } from "lucide-react";
import { MediaUploader } from "@/components/media/MediaUploader";
import { toast } from "sonner";
import { GalleryEditor } from "@/components/repo/GalleryEditor";

type ItemType = "app" | "project" | "content" | "tool" | "lab";

interface ItemForm {
  title: string;
  description: string;
  type: ItemType;
  status: string;
  category_id: string;
  is_premium: boolean;
  content_url: string;
  thumbnail_url: string;
  video_url: string;
  transparent_thumbnail: boolean;
  download_url: string;
  version: string;
  release_notes: string;
  price: string;
  platforms: string;
  gallery: string[];
  body: string;
}

const empty: ItemForm = {
  title: "", description: "", type: "project", status: "published",
  category_id: "", is_premium: false, content_url: "", thumbnail_url: "",
  video_url: "", transparent_thumbnail: false,
  download_url: "", version: "", release_notes: "", price: "", platforms: "", gallery: [], body: "",
};

const typeLabel: Record<string, string> = { app: "App / Programa", project: "Projeto", content: "Conteúdo", tool: "Ferramenta", lab: "Lab" };
const statusOptions = [
  { value: "published", label: "Publicado" },
  { value: "wip", label: "Em desenvolvimento" },
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "archived", label: "Arquivado" },
];

export default function AdminProjetos() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<ItemType>("app");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemForm>(empty);
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-content-items", tab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*, categories:category_id(name)")
        .eq("type", tab)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...empty, type: tab });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      type: item.type,
      status: item.status ?? "published",
      category_id: item.category_id ?? "",
      is_premium: item.is_premium ?? false,
      content_url: item.content_url ?? "",
      thumbnail_url: item.thumbnail_url ?? "",
      video_url: item.video_url ?? "",
      transparent_thumbnail: item.transparent_thumbnail ?? false,
      download_url: item.download_url ?? "",
      version: item.version ?? "",
      release_notes: item.release_notes ?? "",
      price: item.price ? String(item.price) : "",
      platforms: item.platforms ?? "",
      gallery: item.gallery ?? [],
      body: item.body ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title) { toast.error("Título obrigatório."); return; }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description || null,
        type: form.type,
        status: form.status,
        category_id: form.category_id || null,
        is_premium: form.is_premium,
        content_url: form.content_url || null,
        thumbnail_url: form.thumbnail_url || null,
        video_url: form.video_url || null,
        transparent_thumbnail: form.transparent_thumbnail,
        download_url: form.download_url || null,
        version: form.version || null,
        release_notes: form.release_notes || null,
        price: Number(form.price) || 0,
        platforms: form.platforms || null,
        gallery: form.gallery,
        body: form.body || null,
      };
      if (editingId) {
        const { error } = await (supabase as any).from("content_items").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("content_items").insert(payload);
        if (error) throw error;
      }
      toast.success(editingId ? "Atualizado!" : "Criado!");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-content-items"] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao guardar.");
    } finally {
      setSaving(false);
    }
  };

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-content-items"] });
      toast.success("Eliminado.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro."),
  });

  const uploadThumb = async (file: File) => {
    try {
      const path = `thumbs/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error } = await supabase.storage.from("post-resources").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("post-resources").getPublicUrl(path);
      setForm(f => ({ ...f, thumbnail_url: data.publicUrl }));
      toast.success("Imagem carregada.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha no upload.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6" /> Repositórios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Apps e programas, projetos, conteúdos, ferramentas e lab. Projetos e conteúdos aparecem automaticamente no blog.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Novo {typeLabel[tab]}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ItemType)}>
        <TabsList>
          <TabsTrigger value="app">Apps & Programas</TabsTrigger>
          <TabsTrigger value="project">Projetos</TabsTrigger>
          <TabsTrigger value="content">Conteúdos</TabsTrigger>
          <TabsTrigger value="tool">Ferramentas</TabsTrigger>
          <TabsTrigger value="lab">Lab</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Sem entradas. Cria a primeira!</p>
      ) : (
        <div className="space-y-3">
          {items.map((it: any) => (
            <Card key={it.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                {it.thumbnail_url && <img src={it.thumbnail_url} alt="" className="h-14 w-14 rounded-md object-cover" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground">{it.title}</h3>
                    <Badge variant="outline">{statusOptions.find(s => s.value === it.status)?.label ?? it.status}</Badge>
                    {it.is_premium && <Badge>Premium</Badge>}
                    {it.categories?.name && <Badge variant="secondary">{it.categories.name}</Badge>}
                  </div>
                  {it.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{it.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(it)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(it.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Nova entrada"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as ItemType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App / Programa</SelectItem>
                    <SelectItem value="project">Projeto</SelectItem>
                    <SelectItem value="content">Conteúdo</SelectItem>
                    <SelectItem value="tool">Ferramenta</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category_id || "none"} onValueChange={v => setForm(f => ({ ...f, category_id: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Sem categoria —</SelectItem>
                    {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5">
                <span>URL da Aplicação Web / Live Demo (Executável por Iframe)</span>
              </Label>
              <Input
                value={form.content_url}
                onChange={(e) => setForm((f) => ({ ...f, content_url: e.target.value }))}
                placeholder="https://app.exemplo.com ou https://projeto.vercel.app"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ao preencheres este URL, os utilizadores poderão executar a aplicação em tempo real dentro da plataforma através de um Iframe seguro com modo ecrã inteiro e alternador de dispositivos.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MediaUploader
                label="Imagem (thumbnail)"
                value={form.thumbnail_url}
                onChange={(v) => setForm(f => ({ ...f, thumbnail_url: v }))}
                folder="thumbs"
                accept="image/*"
              />
              <MediaUploader
                label="Vídeo (mp4 ou YouTube/Vimeo)"
                value={form.video_url}
                onChange={(v) => setForm(f => ({ ...f, video_url: v }))}
                folder="videos"
                accept="video/*"
              />
            </div>

            {form.type === "app" && (
              <div className="space-y-4 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">Detalhes da app</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><Label>Versão</Label><Input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0.0" /></div>
                  <div><Label>Preço (0 = gratuito)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                  <div><Label>Plataformas</Label><Input value={form.platforms} onChange={e => setForm(f => ({ ...f, platforms: e.target.value }))} placeholder="Windows, Android, Web" /></div>
                </div>
                <MediaUploader label="Ficheiro para download (instalador, zip...)" value={form.download_url}
                  onChange={(v) => setForm(f => ({ ...f, download_url: v }))} folder="downloads" accept="*/*" />
                <div><Label>Notas da versão</Label><Textarea rows={3} value={form.release_notes} onChange={e => setForm(f => ({ ...f, release_notes: e.target.value }))} /></div>
                <p className="text-xs text-muted-foreground">O campo "URL externa" acima serve para Play Store, App Store, site ou página de compra.</p>
              </div>
            )}

            {(form.type === "content" || form.type === "project") && (
              <div>
                <Label>Texto completo (markdown, aparece no blog)</Label>
                <Textarea rows={8} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
            )}

            <GalleryEditor value={form.gallery} onChange={(g) => setForm(f => ({ ...f, gallery: g }))} />

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_premium} onCheckedChange={v => setForm(f => ({ ...f, is_premium: v }))} id="prem" />
                <Label htmlFor="prem">Premium</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.transparent_thumbnail} onCheckedChange={v => setForm(f => ({ ...f, transparent_thumbnail: v }))} id="transp" />
                <Label htmlFor="transp">Imagem sem fundo (PNG)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving ? "A guardar..." : editingId ? "Atualizar" : "Criar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
