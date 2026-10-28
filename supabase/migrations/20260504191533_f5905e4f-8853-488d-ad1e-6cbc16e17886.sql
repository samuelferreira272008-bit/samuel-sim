
-- Restrict EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.admin_audit_log(uuid, text, text, text, jsonb, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.aggregate_daily_metrics(date) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.notify_event(text, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_user_status(uuid, text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.admin_audit_log(uuid, text, text, text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_status(uuid, text) TO authenticated;

-- global_search and has_role remain accessible (used by frontend / RLS)
-- Tighten newsletter & analytics inserts to prevent abuse via overly permissive policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND char_length(email) <= 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (user_id IS NULL OR user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IS NOT NULL
    AND char_length(event_type) <= 100
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Seed admin display_name if missing
UPDATE public.profiles
SET display_name = COALESCE(NULLIF(display_name, ''), 'Samuel Simão'),
    updated_at = now()
WHERE display_name IS NULL OR display_name = '';
