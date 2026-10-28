import { useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MediaUploaderProps {
  label: string;
  bucket?: string;
  folder?: string;
  accept?: string;
  value: string;
  onChange: (url: string) => void;
}

export function MediaUploader({
  label,
  bucket = "businesses",
  folder = "media",
  accept = "image/*,video/*",
  value,
  onChange,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${folder}/${crypto.randomUUID()}-${safe}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Ficheiro carregado.");
    } catch (e: any) {
      toast.error(e.message ?? "Falha no upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL ou carregar ficheiro"
        />
        <label className="inline-flex">
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="outline" size="icon" asChild>
            <span><Upload className="h-4 w-4" /></span>
          </Button>
        </label>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <div className="rounded-lg border border-border/60 bg-muted p-2">
          {/\.(mp4|webm|ogg|mov)$/i.test(value) ? (
            <video src={value} controls className="h-32 w-full rounded object-contain" />
          ) : /youtube\.com|youtu\.be|vimeo\.com/.test(value) ? (
            <p className="px-2 text-xs text-muted-foreground">Vídeo embed: {value}</p>
          ) : (
            <img src={value} alt="" className="h-32 w-full rounded object-contain bg-checker" />
          )}
        </div>
      )}
    </div>
  );
}
