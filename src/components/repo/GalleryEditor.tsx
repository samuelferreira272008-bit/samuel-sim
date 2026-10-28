import { useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  label?: string;
  value: string[];
  onChange: (v: string[]) => void;
  bucket?: string;
  folder?: string;
}

export function GalleryEditor({ label = "Galeria de imagens", value, onChange, bucket = "businesses", folder = "gallery" }: Props) {
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
        if (error) throw error;
        urls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
      }
      onChange([...value, ...urls]);
      toast.success("Imagens carregadas.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha no upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remover"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted">
          <Upload className="h-4 w-4" />
          {uploading ? "A carregar..." : "Adicionar"}
          <input type="file" accept="image/*" multiple className="hidden" disabled={uploading}
            onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>
      {value.length > 0 && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>Limpar galeria</Button>
      )}
    </div>
  );
}
