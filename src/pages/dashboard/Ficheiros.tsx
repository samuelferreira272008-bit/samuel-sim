import { useEffect, useState } from "react";
import { Download, FileArchive, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { listFiles, uploadSecureFile, downloadSecureFile, type FileKind, type StoredFile } from "@/lib/files";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/dashboard/EmptyState";

const labels: Record<FileKind, string> = {
  course: "Curso",
  resource: "Recurso",
  receipt: "Comprovativo",
};

export default function Ficheiros() {
  const { user } = useAuth();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [type, setType] = useState<FileKind>("resource");
  const [filter, setFilter] = useState<FileKind | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    setLoading(true);
    try {
      setFiles(await listFiles(filter === "all" ? undefined : filter));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [filter]);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      await uploadSecureFile(file, type, user.id);
      toast.success("Ficheiro carregado com segurança.");
      event.target.value = "";
      await loadFiles();
    } catch (error: any) {
      toast.error(error.message ?? "Não foi possível carregar o ficheiro.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ficheiros</h1>
        <p className="text-muted-foreground">Carrega e descarrega materiais protegidos por autenticação.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload seguro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as FileKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Curso</SelectItem>
                <SelectItem value="resource">Recurso</SelectItem>
                <SelectItem value="receipt">Comprovativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secure-file">Ficheiro</Label>
            <div className="flex gap-2">
              <Input id="secure-file" type="file" onChange={onUpload} disabled={uploading} />
              <Button disabled={uploading} className="shrink-0">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Biblioteca</h2>
        <Select value={filter} onValueChange={(value) => setFilter(value as FileKind | "all")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="course">Cursos</SelectItem>
            <SelectItem value="resource">Recursos</SelectItem>
            <SelectItem value="receipt">Comprovativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar ficheiros...</p>
      ) : files.length === 0 ? (
        <EmptyState icon={FileArchive} title="Sem ficheiros" description="Ainda não carregaste ficheiros nesta categoria." />
      ) : (
        <div className="grid gap-3">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileArchive className="h-4 w-4 text-muted-foreground" />
                    <p className="truncate font-medium">{file.name}</p>
                    <Badge variant="secondary">{labels[file.type]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {file.mime_type ?? "Ficheiro"} · {file.size_bytes ? `${Math.round(file.size_bytes / 1024)} KB` : "tamanho desconhecido"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadSecureFile(file)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
