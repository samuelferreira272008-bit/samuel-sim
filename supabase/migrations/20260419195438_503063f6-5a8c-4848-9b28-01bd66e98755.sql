-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  event_type TEXT NOT NULL,
  page TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage analytics events"
  ON public.analytics_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Daily metrics aggregate table
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_metrics_date ON public.daily_metrics(date DESC);

ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view daily metrics"
  ON public.daily_metrics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage daily metrics"
  ON public.daily_metrics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_daily_metrics_updated_at
  BEFORE UPDATE ON public.daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Aggregation function: rolls up analytics into daily_metrics
CREATE OR REPLACE FUNCTION public.aggregate_daily_metrics(_target_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_users INT;
  _total_users INT;
  _total_sales INT;
  _revenue NUMERIC;
  _page_views INT;
  _unique_visitors INT;
BEGIN
  SELECT COUNT(*) INTO _new_users
  FROM auth.users
  WHERE created_at::date = _target_date;

  SELECT COUNT(*) INTO _total_users FROM auth.users WHERE created_at::date <= _target_date;

  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO _total_sales, _revenue
  FROM public.purchases
  WHERE status = 'completed' AND created_at::date = _target_date;

  SELECT COUNT(*) INTO _page_views
  FROM public.analytics_events
  WHERE event_type = 'page_view' AND created_at::date = _target_date;

  SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id)) INTO _unique_visitors
  FROM public.analytics_events
  WHERE created_at::date = _target_date;

  INSERT INTO public.daily_metrics (date, total_users, new_users, total_sales, revenue, page_views, unique_visitors)
  VALUES (_target_date, _total_users, _new_users, _total_sales, _revenue, _page_views, _unique_visitors)
  ON CONFLICT (date) DO UPDATE
  SET total_users = EXCLUDED.total_users,
      new_users = EXCLUDED.new_users,
      total_sales = EXCLUDED.total_sales,
      revenue = EXCLUDED.revenue,
      page_views = EXCLUDED.page_views,
      unique_visitors = EXCLUDED.unique_visitors,
      updated_at = now();
END;
$$;