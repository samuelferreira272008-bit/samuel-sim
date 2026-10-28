import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VideoEmbed } from "@/components/blog/VideoEmbed";
import { CommentSection } from "@/components/blog/CommentSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Download, ExternalLink, Lock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db, repoTypeLabel, repoTypePath } from "@/lib/repo";
import { useSEO } from "@/lib/seo";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { user, role } = useAuth();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post-or-repo", slug],
    queryFn: async () => {
      // 1. Try posts table by slug
      const { data } = await supabase
        .from("posts")
        .select("*, categories:category_id(name)")
        .eq("slug", slug!)
        .maybeSingle();

      if (data) {
        let authorName: string | null = null;
        if (data.author_id) {
          const { data: prof } = await supabase
            .from("profiles_public" as any)
            .select("display_name")
            .eq("user_id", data.author_id)
            .maybeSingle();
          authorName = (prof as any)?.display_name ?? null;
        }
        return { ...data, author_name: authorName, _source: "post" as const };
      }

      // 2. Fallback: Try content_items table by id (for published projects & content)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug ?? "");
      if (isUuid) {
        const { data: item } = await db
          .from("content_items")
          .select("*, categories:category_id(name)")
          .eq("id", slug!)
          .maybeSingle();

        if (item) {
          return {
            id: item.id,
            title: item.title,
            slug: item.id,
            excerpt: item.description,
            content: item.body || item.description || "",
            cover_image: item.thumbnail_url ?? item.gallery?.[0] ?? null,
            video_url: item.video_url ?? null,
            access_level: item.is_premium ? "premium" : "public",
            created_at: item.created_at,
            categories: item.categories,
            author_name: "Samuel Simão",
            _source: "repo" as const,
            _repoItem: item,
          };
        }
      }

      return null;
    },
    enabled: !!slug,
  });

  useSEO({
    title: post ? `${(post as any).seo_title || post.title} — Samuel Simão` : "Blog — Samuel Simão",
    description: (post as any)?.seo_description || post?.excerpt || undefined,
    image: post?.cover_image ?? null,
    type: "article",
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? "",
          image: post.cover_image ? [post.cover_image] : undefined,
          datePublished: post.created_at,
          author: {
            "@type": "Person",
            name: (post as any).author_name || "Samuel Simão",
          },
        }
      : undefined,
  });

  const isPostSource = post?._source === "post";

  const { data: links = [] } = useQuery({
    queryKey: ["post-links", post?.id],
    queryFn: async () => {
      const { data } = await supabase.from("post_links").select("*").eq("post_id", post!.id);
      return data ?? [];
    },
    enabled: !!post?.id && isPostSource,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["post-resources", post?.id],
    queryFn: async () => {
      const { data } = await supabase.from("post_resources").select("*").eq("post_id", post!.id);
      return data ?? [];
    },
    enabled: !!post?.id && isPostSource,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Artigo não encontrado</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary underline">Voltar ao blog</Link>
      </div>
    );
  }

  // Access control
  const canAccess =
    post.access_level === "public" ||
    (post.access_level === "restricted" && !!user) ||
    (post.access_level === "premium" && role === "admin");

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Conteúdo Restrito</h1>
        <p className="mt-2 text-muted-foreground">
          {post.access_level === "restricted"
            ? "Precisas de iniciar sessão para aceder a este conteúdo."
            : "Este conteúdo é exclusivo para membros premium."}
        </p>
        {!user && (
          <Link to="/login">
            <Button className="mt-4">Iniciar Sessão</Button>
          </Link>
        )}
      </div>
    );
  }

  const date = new Date(post.created_at).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const repoItem = (post as any)._repoItem;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>
        {repoItem && repoTypePath[repoItem.type] && (
          <Link
            to={`${repoTypePath[repoItem.type]}/${repoItem.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            Ver página no repositório ({repoTypeLabel[repoItem.type] ?? repoItem.type})
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {repoItem && (
            <Badge variant="outline">{repoTypeLabel[repoItem.type] ?? repoItem.type}</Badge>
          )}
          {post.categories?.name && <Badge variant="secondary">{post.categories.name}</Badge>}
          {post.access_level !== "public" && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              {post.access_level === "premium" ? "Premium" : "Restrito"}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {(post as any).author_name || "Samuel Simão"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {date}
          </span>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="mb-8 w-full rounded-lg border border-border object-cover"
        />
      )}

      {/* Video */}
      {post.video_url && <VideoEmbed url={post.video_url} />}

      {/* Description lead if repo item has both description and body */}
      {repoItem?.description && repoItem?.body && (
        <p className="mb-6 text-lg text-muted-foreground">{repoItem.description}</p>
      )}

      {/* Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </article>

      {/* Repo Item Actions & Gallery */}
      {repoItem && (repoItem.content_url || repoItem.download_url) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {repoItem.content_url && (
            <Button asChild>
              <a href={repoItem.content_url} target="_blank" rel="noopener noreferrer">
                Abrir Link <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
          {repoItem.download_url && (
            <Button variant="outline" asChild>
              <a href={repoItem.download_url} target="_blank" rel="noopener noreferrer" download>
                <Download className="mr-2 h-4 w-4" /> Download
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="mt-10 rounded-lg border border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ExternalLink className="h-5 w-5" /> Links Úteis
          </h3>
          <ul className="space-y-2">
            {links.map((link: any) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div className="mt-6 rounded-lg border border-border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Download className="h-5 w-5" /> Recursos para Download
          </h3>
          <div className="flex flex-wrap gap-3">
            {resources.map((res: any) => (
              <a key={res.id} href={res.file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  {res.title}
                </Button>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Comments (only for posts table) */}
      {isPostSource && <CommentSection postId={post.id} />}
    </div>
  );
}
