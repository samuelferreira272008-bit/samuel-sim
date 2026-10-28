ALTER TABLE public.products DROP CONSTRAINT products_type_check;
ALTER TABLE public.products ADD CONSTRAINT products_type_check CHECK (type IN ('digital','course','template','ebook','physical'));
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS checkout_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AOA';

ALTER TABLE public.content_items DROP CONSTRAINT content_items_type_check;
ALTER TABLE public.content_items ADD CONSTRAINT content_items_type_check CHECK (type IN ('article','video','download','course','project','tool','lab','app','content'));
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS download_url text,
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS release_notes text,
  ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platforms text,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS body text;

CREATE TABLE public.site_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT 'Samuel Simão',
  headline text,
  bio text,
  photos text[] NOT NULL DEFAULT '{}',
  contact_email text,
  contact_phone text,
  whatsapp text,
  location text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  terms_text text,
  privacy_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_profile TO authenticated;
GRANT ALL ON public.site_profile TO service_role;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site profile is public" ON public.site_profile FOR SELECT USING (true);
CREATE POLICY "Admins manage site profile" ON public.site_profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_site_profile_updated_at BEFORE UPDATE ON public.site_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.site_profile (full_name, headline) VALUES ('Samuel Simão', 'Criador digital, developer e educador');