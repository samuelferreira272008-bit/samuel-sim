CREATE TABLE IF NOT EXISTS public.platform_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  label TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'content',
  status TEXT NOT NULL DEFAULT 'created',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform backups"
ON public.platform_backups
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_platform_backups_created ON public.platform_backups(created_at DESC);