-- Relax type constraint to include new types
ALTER TABLE public.content_items DROP CONSTRAINT IF EXISTS content_items_type_check;
ALTER TABLE public.content_items
  ADD CONSTRAINT content_items_type_check
  CHECK (type = ANY (ARRAY['article','video','download','course','project','tool','lab']));

ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS community_whatsapp text,
  ADD COLUMN IF NOT EXISTS community_telegram text,
  ADD COLUMN IF NOT EXISTS community_discord text,
  ADD COLUMN IF NOT EXISTS sponsorship_message text;

INSERT INTO public.platform_settings (platform_name)
SELECT 'Samuel Simão'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  tier text NOT NULL DEFAULT 'bronze',
  link text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sponsors are viewable by everyone" ON public.sponsors;
CREATE POLICY "Sponsors are viewable by everyone" ON public.sponsors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage sponsors" ON public.sponsors;
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.handle_certificate_issued()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.user_id,
    'Recebeste um novo certificado',
    COALESCE(NEW.title, 'Certificado emitido'),
    'system',
    '/certificados',
    jsonb_build_object('certificate_id', NEW.id)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_certificate_issued ON public.certificates;
CREATE TRIGGER on_certificate_issued
AFTER INSERT ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.handle_certificate_issued();

INSERT INTO public.categories (name, slug)
SELECT v.name, v.slug
FROM (VALUES
  ('Tecnologia', 'tecnologia'),
  ('Educação', 'educacao'),
  ('Negócios', 'negocios'),
  ('Espiritualidade', 'espiritualidade'),
  ('Vida Pessoal', 'vida-pessoal')
) AS v(name, slug)
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = v.slug);

INSERT INTO public.content_items (type, title, description, content_url, status)
SELECT * FROM (VALUES
  ('project'::text, 'Plataforma Samuel Simão', 'Hub digital com blog, comunidade, ferramentas e loja.', 'https://samuelsimao.lovable.app', 'published'::text),
  ('tool',          'Conversor de Markdown',  'Converte texto em markdown formatado para o blog.',     'https://markdown-it.github.io/', 'published'),
  ('tool',          'Gerador de Slugs',       'Cria slugs amigáveis para URLs a partir de qualquer título.', 'https://slugify.online/', 'published'),
  ('lab',           'Assistente IA interno',  'Assistente conversacional treinado no contexto da plataforma.', '/assistente', 'beta'),
  ('lab',           'Validação de comprovativos por OCR', 'Protótipo que extrai dados de talões via IA.', NULL, 'wip')
) AS t(type, title, description, content_url, status)
WHERE NOT EXISTS (SELECT 1 FROM public.content_items);

UPDATE public.notifications SET read = true WHERE read = false;
UPDATE public.posts SET published = false WHERE slug = 'nao';