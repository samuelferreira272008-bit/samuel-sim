import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Building2, Link as LinkIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/media/MediaUploader";

const db = supabase as any;

interface BForm {
  name: string; slug: string; tagline: string; description: string;
  mission: string; vision: string;
  logo_url: string; cover_url: string; video_url: string;
  website: string; sort_order: number; is_published: boolean;
}

const empty: BForm = {
  name: "", slug: "", tagline: "", description: "", mission: "", vision: "",
  logo_url: "", cover_url: "", video_url: "", website: "",
  sort_order: 0, is_published: true,
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminEmpresas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BForm>(empty);
  const [linkDialog, setLinkDialog] = useState<string | null>(null);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const { data, error } = await db.from("businesses").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Nome obrigatório.");
      const slug = form.slug.trim() || slugify(form.name);
      const payload = { ...form, slug, name: form.name.trim() };
      const res = editingId
        ? await db.from("businesses").update(payload).eq("id", editingId)
        : await db.from("businesses").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success("Empresa guardada.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("businesses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Eliminada."); qc.invalidateQueries({ queryKey: ["admin-businesses"] }); },
  });

  const openCreate = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({
      name: b.name ?? "", slug: b.slug ?? "", tagline: b.tagline ?? "", description: b.description ?? "",
      mission: b.mission ?? "", vision: b.vision ?? "",
      logo_url: b.logo_url ?? "", cover_url: b.cover_url ?? "", video_url: b.video_url ?? "",
      website: b.website ?? "", sort_order: b.sort_order ?? 0, is_published: !!b.is_published,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="h-6 w-6" /> Empresas</h1>
          <p className="text-sm text-muted-foreground">Negócios apresentados em /empresas, com missão, visão, media e vínculos a produtos/projectos/ferramentas.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nova empresa</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : businesses.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Sem empresas. Cria a primeira!</p>
      ) : (
        <div className="grid gap-3">
          {businesses.map((b: any) => (
            <Card key={b.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {b.logo_url
                  ? <img src={b.logo_url} alt="" className="h-12 w-12 rounded-md border bg-checker object-contain p-1" />
                  : <div className="h-12 w-12 rounded-md bg-muted" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{b.name}</h3>
                    <Badge variant={b.is_published ? "default" : "secondary"}>{b.is_published ? "Publicada" : "Rascunho"}</Badge>
                    <span className="text-xs text-muted-foreground">/{b.slug}</span>
                  </div>
                  {b.tagline && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{b.tagline}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setLinkDialog(b.id)} title="Vínculos">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(b.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar empresa" : "Nova empresa"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
            </div>
            <div><Label>Tagline (frase curta)</Label><Input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Missão</Label><Textarea rows={3} value={form.mission} onChange={e => setForm(f => ({ ...f, mission: e.target.value }))} /></div>
              <div><Label>Visão</Label><Textarea rows={3} value={form.vision} onChange={e => setForm(f => ({ ...f, vision: e.target.value }))} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MediaUploader label="Logo (PNG sem fundo recomendado)" value={form.logo_url} onChange={(v) => setForm(f => ({ ...f, logo_url: v }))} folder="logos" accept="image/*" />
              <MediaUploader label="Imagem de capa" value={form.cover_url} onChange={(v) => setForm(f => ({ ...f, cover_url: v }))} folder="covers" accept="image/*" />
            </div>
            <MediaUploader label="Vídeo de apresentação (mp4 ou YouTube/Vimeo)" value={form.video_url} onChange={(v) => setForm(f => ({ ...f, video_url: v }))} folder="videos" accept="video/*" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></div>
              <div><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value || 0) }))} /></div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} id="pub" />
                <Label htmlFor="pub">Publicada</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {linkDialog && <LinksDialog businessId={linkDialog} onClose={() => setLinkDialog(null)} />}
    </div>
  );
}

function LinksDialog({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<"content" | "product">("content");
  const [selectedId, setSelectedId] = useState("");

  const { data: links = [] } = useQuery({
    queryKey: ["business-links-admin", businessId],
    queryFn: async () => {
      const { data } = await db
        .from("business_links")
        .select("*, content_items:content_item_id(title,type), products:product_id(name)")
        .eq("business_id", businessId)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: contentItems = [] } = useQuery({
    queryKey: ["content-items-options"],
    queryFn: async () => (await db.from("content_items").select("id,title,type").order("title")).data ?? [],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products-options"],
    queryFn: async () => (await db.from("products").select("id,name").order("name")).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("Seleciona um item.");
      const payload: any = { business_id: businessId };
      if (kind === "content") payload.content_item_id = selectedId;
      else payload.product_id = selectedId;
      const { error } = await db.from("business_links").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Vínculo adicionado."); setSelectedId(""); qc.invalidateQueries({ queryKey: ["business-links-admin", businessId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeLink = useMutation({
    mutationFn: async (id: string) => { const { error } = await db.from("business_links").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-links-admin", businessId] }),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Vínculos da empresa</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-40">
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(v) => { setKind(v as any); setSelectedId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Projeto/Tool/Lab</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label>Item</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {(kind === "content" ? contentItems : products).map((it: any) => (
                    <SelectItem key={it.id} value={it.id}>
                      {kind === "content" ? `${it.title} · ${it.type}` : it.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => add.mutate()} disabled={add.isPending}><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
          </div>

          <div className="space-y-2">
            {links.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sem vínculos.</p>
            ) : links.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Badge variant="outline">{l.content_items ? l.content_items.type : "produto"}</Badge>
                <span className="flex-1 text-sm text-foreground">{l.content_items?.title ?? l.products?.name}</span>
                <Button size="icon" variant="ghost" onClick={() => removeLink.mutate(l.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end"><Button variant="outline" onClick={onClose}>Fechar</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
