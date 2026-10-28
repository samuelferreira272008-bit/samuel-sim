-- 1. System logs table
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_logs_event_type ON public.system_logs(event_type);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system logs"
  ON public.system_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage system logs"
  ON public.system_logs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Newsletter subscribers (independent of users)
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  user_id UUID,
  confirmed BOOLEAN NOT NULL DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_user_id ON public.newsletter_subscribers(user_id);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own subscription"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscribers"
  ON public.newsletter_subscribers FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. User notification preferences (on profiles)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_new_posts BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_payments BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 4. Helper function to call dispatch-event edge function from triggers
CREATE OR REPLACE FUNCTION public.notify_event(_event_type TEXT, _payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the event immediately (handler will pick up async)
  INSERT INTO public.system_logs (event_type, payload, status)
  VALUES (_event_type, _payload, 'queued');
END;
$$;

-- 5. Trigger on auth.users for welcome event (extends existing handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_event('user_registered', jsonb_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'display_name', COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_event ON auth.users;
CREATE TRIGGER on_auth_user_created_event
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_event();

-- 6. Trigger on purchases for payment events
CREATE OR REPLACE FUNCTION public.handle_purchase_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event TEXT;
  _user_email TEXT;
  _product_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'completed' THEN _event := 'payment_approved';
    ELSIF NEW.status = 'pending' THEN _event := 'payment_pending';
    ELSIF NEW.status = 'rejected' THEN _event := 'payment_rejected';
    ELSE RETURN NEW;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'completed' THEN _event := 'payment_approved';
    ELSIF NEW.status = 'pending' THEN _event := 'payment_pending';
    ELSIF NEW.status = 'rejected' THEN _event := 'payment_rejected';
    ELSE RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  SELECT name INTO _product_name FROM public.products WHERE id = NEW.product_id;

  PERFORM public.notify_event(_event, jsonb_build_object(
    'purchase_id', NEW.id,
    'user_id', NEW.user_id,
    'product_id', NEW.product_id,
    'product_name', _product_name,
    'amount', NEW.amount,
    'status', NEW.status
  ));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_purchase_change ON public.purchases;
CREATE TRIGGER on_purchase_change
  AFTER INSERT OR UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_purchase_event();

-- 7. Trigger on posts for publish event
CREATE OR REPLACE FUNCTION public.handle_post_published_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.published = true)
     OR (TG_OP = 'UPDATE' AND OLD.published = false AND NEW.published = true) THEN
    PERFORM public.notify_event('new_post_published', jsonb_build_object(
      'post_id', NEW.id,
      'title', NEW.title,
      'slug', NEW.slug,
      'excerpt', NEW.excerpt,
      'cover_image', NEW.cover_image
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_post_published ON public.posts;
CREATE TRIGGER on_post_published
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_published_event();