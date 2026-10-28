
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  mission text,
  vision text,
  logo_url text,
  cover_url text,
  video_url text,
  website text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses viewable by everyone"
ON public.businesses FOR SELECT TO public
USING (is_published = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage businesses"
ON public.businesses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.business_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  content_item_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  label text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (content_item_id IS NOT NULL)::int + (product_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_business_links_business ON public.business_links(business_id);

ALTER TABLE public.business_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business links viewable by everyone"
ON public.business_links FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage business links"
ON public.business_links FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Bucket público para media de empresas (logos, capas, vídeos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('businesses', 'businesses', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Business media public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'businesses');

CREATE POLICY "Admins upload business media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'businesses' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update business media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'businesses' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete business media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'businesses' AND public.has_role(auth.uid(), 'admin'::app_role));
