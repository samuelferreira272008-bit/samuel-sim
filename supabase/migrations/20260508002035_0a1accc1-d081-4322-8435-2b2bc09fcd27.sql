
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS transparent_thumbnail boolean NOT NULL DEFAULT false;
