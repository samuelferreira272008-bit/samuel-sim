
-- 1. Profiles: restrict SELECT, expose safe fields via view
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT id, user_id, display_name, avatar_url, bio, created_at
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 2. user_roles: prevent privilege escalation
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Private storage buckets: add UPDATE policy
CREATE POLICY "Users can update own secure files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = ANY (ARRAY['course-files'::text, 'resources'::text, 'receipts'::text])
    AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role))
  )
  WITH CHECK (
    bucket_id = ANY (ARRAY['course-files'::text, 'resources'::text, 'receipts'::text])
    AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'::app_role))
  );

-- 4. Public buckets: drop broad listing policies (public URLs still work)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Post resources are publicly accessible" ON storage.objects;
