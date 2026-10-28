
-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'premium')),
  video_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone" ON public.posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage comments" ON public.comments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Post links table
CREATE TABLE public.post_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post links are viewable by everyone" ON public.post_links FOR SELECT USING (true);
CREATE POLICY "Admins can manage post links" ON public.post_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Post resources table
CREATE TABLE public.post_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post resources are viewable by everyone" ON public.post_resources FOR SELECT USING (true);
CREATE POLICY "Admins can manage post resources" ON public.post_resources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for post resources
INSERT INTO storage.buckets (id, name, public) VALUES ('post-resources', 'post-resources', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Post resources are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-resources');
CREATE POLICY "Admins can upload post resources" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-resources' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete post resources" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-resources' AND public.has_role(auth.uid(), 'admin'));
