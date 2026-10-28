CREATE TABLE IF NOT EXISTS public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type TEXT,
  content_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bucket, path)
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
ON public.files FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own files"
ON public.files FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
ON public.files FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_files_user_type ON public.files(user_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_content ON public.files(content_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-files', 'course-files', false), ('resources', 'resources', false), ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload to own secure folders"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('course-files', 'resources', 'receipts')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own secure files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('course-files', 'resources', 'receipts')
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can delete own secure files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN ('course-files', 'resources', 'receipts')
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'system',
  _link TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
  VALUES (_user_id, _title, _message, _type, _link, COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_purchase_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _product_name TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT name INTO _product_name FROM public.products WHERE id = NEW.product_id;

  IF NEW.status = 'completed' THEN
    PERFORM public.create_notification(NEW.user_id, 'Pagamento aprovado', 'O teu acesso foi desbloqueado para ' || COALESCE(_product_name, 'o produto comprado') || '.', 'payment', '/compras', jsonb_build_object('purchase_id', NEW.id, 'product_id', NEW.product_id));
  ELSIF NEW.status = 'pending' THEN
    PERFORM public.create_notification(NEW.user_id, 'Pagamento em análise', 'Recebemos o teu comprovativo e estamos a validar o pagamento.', 'payment', '/compras', jsonb_build_object('purchase_id', NEW.id, 'product_id', NEW.product_id));
  ELSIF NEW.status = 'rejected' THEN
    PERFORM public.create_notification(NEW.user_id, 'Pagamento rejeitado', 'Não foi possível validar o pagamento. Revê os dados e tenta novamente.', 'payment', '/compras', jsonb_build_object('purchase_id', NEW.id, 'product_id', NEW.product_id));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_purchase_notification ON public.purchases;
CREATE TRIGGER trg_purchase_notification
AFTER INSERT OR UPDATE OF status ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.handle_purchase_notification();

CREATE OR REPLACE FUNCTION public.handle_post_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.published = true)
     OR (TG_OP = 'UPDATE' AND OLD.published = false AND NEW.published = true) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
    SELECT p.user_id, 'Novo conteúdo publicado', NEW.title, 'content', '/blog/' || NEW.slug, jsonb_build_object('post_id', NEW.id)
    FROM public.profiles p
    WHERE p.notify_new_posts = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_notification ON public.posts;
CREATE TRIGGER trg_post_notification
AFTER INSERT OR UPDATE OF published ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.handle_post_notification();

CREATE OR REPLACE FUNCTION public.global_search(_query TEXT, _type TEXT DEFAULT 'all')
RETURNS TABLE(id UUID, type TEXT, title TEXT, description TEXT, url TEXT, rank REAL)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (SELECT plainto_tsquery('simple', COALESCE(NULLIF(trim(_query), ''), '')) AS tsq)
  SELECT p.id, 'post'::text, p.title, COALESCE(p.excerpt, '') AS description, '/blog/' || p.slug AS url,
         ts_rank(to_tsvector('simple', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || COALESCE(p.content, '')), q.tsq) AS rank
  FROM public.posts p, q
  WHERE p.published = true AND (_type IN ('all', 'post'))
    AND (_query IS NULL OR trim(_query) = '' OR to_tsvector('simple', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || COALESCE(p.content, '')) @@ q.tsq OR p.title ILIKE '%' || _query || '%')
  UNION ALL
  SELECT pr.id, 'product'::text, pr.name, COALESCE(pr.description, '') AS description, '/comprar' AS url,
         ts_rank(to_tsvector('simple', pr.name || ' ' || COALESCE(pr.description, '')), q.tsq) AS rank
  FROM public.products pr, q
  WHERE pr.is_active = true AND (_type IN ('all', 'product'))
    AND (_query IS NULL OR trim(_query) = '' OR to_tsvector('simple', pr.name || ' ' || COALESCE(pr.description, '')) @@ q.tsq OR pr.name ILIKE '%' || _query || '%')
  UNION ALL
  SELECT c.id, 'project'::text, c.title, COALESCE(c.description, '') AS description, '/projetos' AS url,
         ts_rank(to_tsvector('simple', c.title || ' ' || COALESCE(c.description, '')), q.tsq) AS rank
  FROM public.content_items c, q
  WHERE c.type = 'project' AND (_type IN ('all', 'project'))
    AND (_query IS NULL OR trim(_query) = '' OR to_tsvector('simple', c.title || ' ' || COALESCE(c.description, '')) @@ q.tsq OR c.title ILIKE '%' || _query || '%')
  ORDER BY rank DESC, title ASC
  LIMIT 50;
$$;