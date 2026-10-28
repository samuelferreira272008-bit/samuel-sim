CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  event_type TEXT NOT NULL DEFAULT 'message',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage"
ON public.ai_usage_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own AI usage"
ON public.ai_usage_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage AI usage"
ON public.ai_usage_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_ai_usage_events_user_created ON public.ai_usage_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_events_created ON public.ai_usage_events(created_at DESC);