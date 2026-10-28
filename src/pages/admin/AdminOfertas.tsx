import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Power, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MediaUploader } from "@/components/media/MediaUploader";
import { GalleryEditor } from "@/components/repo/GalleryEditor";
import { db, formatPrice } from "@/lib/repo";

const typeOptions = [
  { value: "physical", label: "Produto físico" },
  { value: "digital", label: "Produto digital" },
  { value: "course", label: "Curso" },
  { value: "ebook", label: "E-book" },
  { value: "template", label: "Template" },
];

const emptyProduct = {
  name: "", description: "", price: "0", currency: "AOA", type: "digital", image_url: "",
  linked_content_id: "none", is_active: true, checkout_url: "", whatsapp_url: "", gallery: [] as string[],
};

export default function AdminOfertas() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await db.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: content = [] } = useQuery({
    queryKey: ["admin-product-content"],
    queryFn: async () => (await db.from("content_items").select("id,title,type").order("title")).data ?? [],
  });

  const persist = async (id: string | null, f: typeof emptyProduct) => {
    if (!f.name.trim()) throw new Error("Nome obrigatório.");
    const payload = {
      name: f.name.trim(),
      description: f.description.trim() || null,
      price: Number(f.price || 0),
      currency: f.currency || "AOA",
      type: f.type,
      image_url: f.image_url.trim() || null,
      linked_content_id: f.linked_content_id === "none" ? null : f.linked_content_id,
      is_active: f.is_active,
      checkout_url: f.checkout_url.trim() || null,
      whatsapp_url: f.whatsapp_url.trim() || null,
      gallery: f.gallery,
    };
    const res = id ? await db.from("products").update(payload).eq("id", id) : await db.from("products").insert(payload);
    if (res.error) throw res.error;
  };

  const toForm = (p: any) => ({
    name: p.name ?? "", description: p.description ?? "", price: String(p.price ?? 0), currency: p.currency ?? "AOA",
    type: p.type ?? "digital", image_url: p.image_url ?? "", linked_content_id: p.linked_content_id ?? "none",
    is_active: !!p.is_active, checkout_url: p.checkout_url ?? "", whatsapp_url: p.whatsapp_url ?? "", gallery: p.gallery ?? [],
  });

  const save = useMutation({
    mutationFn: () => persist(editingId, form),
    onSuccess: () => { toast.success("Produto guardado."); setOpen(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (p: any) => persist(p.id, { ...toForm(p), is_active: !p.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await db.from("products").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Produto eliminado."); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (patch: Partial<typeof emptyProduct>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Package className="h-6 w-6" /> Produtos</h1>
          <p className="text-sm text-muted-foreground">Produtos físicos e digitais. A compra é feita pelo link de checkout ou WhatsApp.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(emptyProduct); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />Novo produto</Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">A carregar...</p> : products.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Sem produtos. Cria o primeiro!</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="flex items-start gap-4 p-4">
                {p.image_url && <img src={p.image_url} alt="" className="h-16 w-16 rounded-md object-cover" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "ativo" : "inativo"}</Badge>
                    <Badge variant="outline">{typeOptions.find((t) => t.value === p.type)?.label ?? p.type}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description ?? "Sem descrição"}</p>
                  <p className="mt-2 font-bold text-foreground">{formatPrice(p.price, p.currency ?? "AOA")}</p>
                  {!p.checkout_url && !p.whatsapp_url && <p className="mt-1 text-xs text-destructive">Sem link de compra configurado</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingId(p.id); setForm(toForm(p)); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => toggle.mutate(p)}><Power className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(p.id)} title="Eliminar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div><Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => set({ type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{typeOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Descrição</Label><Textarea rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Preço</Label><Input type="number" value={form.price} onChange={(e) => set({ price: e.target.value })} /></div>
              <div><Label>Moeda</Label>
                <Select value={form.currency} onValueChange={(v) => set({ currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["AOA", "EUR", "USD", "BRL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Link de checkout externo</Label><Input value={form.checkout_url} onChange={(e) => set({ checkout_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>WhatsApp (número ou link)</Label><Input value={form.whatsapp_url} onChange={(e) => set({ whatsapp_url: e.target.value })} placeholder="+244 9xx xxx xxx" /></div>
            </div>
            <MediaUploader label="Imagem principal" value={form.image_url} onChange={(v) => set({ image_url: v })} folder="products" accept="image/*" />
            <GalleryEditor value={form.gallery} onChange={(g) => set({ gallery: g })} folder="products" />
            <div><Label>Conteúdo associado (opcional)</Label>
              <Select value={form.linked_content_id} onValueChange={(v) => set({ linked_content_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem associação</SelectItem>
                  {content.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.title} · {c.type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set({ is_active: v })} /><Label>Visível na vitrine</Label></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "A guardar..." : "Guardar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
