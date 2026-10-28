import { supabase } from "@/integrations/supabase/client";

export type FileKind = "course" | "resource" | "receipt";

const bucketByKind: Record<FileKind, string> = {
  course: "course-files",
  resource: "resources",
  receipt: "receipts",
};

export interface StoredFile {
  id: string;
  user_id: string;
  bucket: string;
  path: string;
  name: string;
  type: FileKind;
  size_bytes: number | null;
  mime_type: string | null;
  content_id: string | null;
  created_at: string;
}

const db = supabase as any;

export async function listFiles(type?: FileKind) {
  let query = db.from("files").select("*").order("created_at", { ascending: false });
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StoredFile[];
}

export async function uploadSecureFile(file: File, type: FileKind, userId: string, contentId?: string) {
  const bucket = bucketByKind[type];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await db
    .from("files")
    .insert({
      user_id: userId,
      bucket,
      path,
      name: file.name,
      type,
      size_bytes: file.size,
      mime_type: file.type || null,
      content_id: contentId ?? null,
      url: path,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as StoredFile;
}

export async function getSignedFileUrl(file: StoredFile, expiresIn = 300) {
  const { data, error } = await supabase.storage.from(file.bucket).createSignedUrl(file.path, expiresIn, {
    download: file.name,
  });
  if (error) throw error;
  return data.signedUrl;
}

export async function downloadSecureFile(file: StoredFile) {
  const url = await getSignedFileUrl(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
