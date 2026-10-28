-- Admin management foundation
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'blog',
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS linked_content_id UUID,
  ADD COLUMN IF NOT EXISTS payment_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL DEFAULT 'Samuel Simão',
  email_from TEXT,
  resend_enabled BOOLEAN NOT NULL DEFAULT false,
  payment_iban TEXT,
  payment_account_name TEXT,
  enable_ai BOOLEAN NOT NULL DEFAULT true,
  enable_payments BOOLEAN NOT NULL DEFAULT true,
  enable_blog BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.manual_payment_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID,
  user_id UUID NOT NULL,
  proof_file_id UUID,
  expected_amount NUMERIC,
  detected_amount NUMERIC,
  expected_reference TEXT,
  detected_reference TEXT,
  extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_payment_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage manual payment reviews" ON public.manual_payment_reviews;
CREATE POLICY "Admins can manage manual payment reviews"
ON public.manual_payment_reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own manual payment reviews" ON public.manual_payment_reviews;
CREATE POLICY "Users can view own manual payment reviews"
ON public.manual_payment_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.system_logs
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS actor_id UUID,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS target_type TEXT,
  ADD COLUMN IF NOT EXISTS target_id TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at ON public.profiles(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON public.posts(content_type);
CREATE INDEX IF NOT EXISTS idx_manual_payment_reviews_status ON public.manual_payment_reviews(status);
CREATE INDEX IF NOT EXISTS idx_manual_payment_reviews_user_id ON public.manual_payment_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_actor_id ON public.system_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_manual_payment_reviews_updated_at ON public.manual_payment_reviews;
CREATE TRIGGER update_manual_payment_reviews_updated_at
BEFORE UPDATE ON public.manual_payment_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.admin_audit_log(
  _actor_id UUID,
  _action TEXT,
  _target_type TEXT DEFAULT NULL,
  _target_id TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb,
  _severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  INSERT INTO public.system_logs(event_type, status, severity, actor_id, action, target_type, target_id, payload, metadata)
  VALUES ('admin_action', 'completed', COALESCE(_severity, 'info'), _actor_id, _action, _target_type, _target_id, COALESCE(_metadata, '{}'::jsonb), COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_role(_target_user_id UUID, _role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  INSERT INTO public.user_roles(user_id, role) VALUES (_target_user_id, _role);

  PERFORM public.admin_audit_log(auth.uid(), 'user_role_changed', 'user', _target_user_id::text, jsonb_build_object('role', _role));
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_status(_target_user_id UUID, _status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF _status NOT IN ('active', 'deactivated', 'banned') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.profiles
  SET status = _status,
      deactivated_at = CASE WHEN _status = 'active' THEN NULL ELSE now() END,
      updated_at = now()
  WHERE user_id = _target_user_id;

  PERFORM public.admin_audit_log(auth.uid(), 'user_status_changed', 'user', _target_user_id::text, jsonb_build_object('status', _status));
END;
$$;

INSERT INTO public.platform_settings (platform_name)
SELECT 'Samuel Simão'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);
