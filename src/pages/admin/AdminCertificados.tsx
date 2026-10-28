import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const db = supabase as any;

export default function AdminCertificados() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-profiles-list"],
    queryFn: async () => {
      const { data } = await db.from("profiles").select("user_id,display_name").order("display_name");
      return data ?? [];
    },
  });

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const { data } = await db.from("certificates").select("*").order("issued_at", { ascending: false });
      return data ?? [];
    },
  });

  const issue = useMutation({
    mutationFn: async () => {
      if (!userId || !title) throw new Error("Utilizador e título são obrigatórios.");
      const { error } = await db.from("certificates").insert({
        user_id: userId,
        title,
        description: description || null,
        file_url: fileUrl || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Certificado emitido. O utilizador foi notificado.");
      setUserId(""); setTitle(""); setDescription(""); setFileUrl("");
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("certificates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Certificado revogado.");
      qc.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `certificates/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("resources").upload(path, file);
      if (error) throw error;
      const { data: signed } = await supabase.storage.from("resources").createSignedUrl(path, 60 * 60 * 24 * 365);
      setFileUrl(signed?.signedUrl ?? "");
      toast.success("Ficheiro carregado.");
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao carregar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certificados</h1>
        <p className="text-muted-foreground">Emite e gere certificados dos utilizadores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Emitir novo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Utilizador</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar utilizador" /></SelectTrigger>
              <SelectContent>
                {users.map((u: any) => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.display_name ?? u.user_id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Conclusão do curso X" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Ficheiro (PDF/imagem)</Label>
            <Input type="file" accept="application/pdf,image/*" onChange={handleUpload} disabled={uploading} />
            {fileUrl && <p className="text-xs text-muted-foreground truncate">URL: {fileUrl}</p>}
          </div>
          <div className="md:col-span-2">
            <Button onClick={() => issue.mutate()} disabled={issue.isPending || uploading}>
              {issue.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Emitir certificado
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Emitidos</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : certs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem certificados emitidos.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Emitido</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certs.map((c: any) => {
                  const u = users.find((x: any) => x.user_id === c.user_id);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell className="text-muted-foreground">{u?.display_name ?? c.user_id.slice(0, 8)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.issued_at).toLocaleDateString("pt-PT")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => revoke.mutate(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
