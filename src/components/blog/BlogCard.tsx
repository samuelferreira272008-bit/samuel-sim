import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Lock } from "lucide-react";

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  accessLevel: string;
  createdAt: string;
  href?: string;
  typeBadge?: string | null;
}

export function BlogCard({
  title,
  slug,
  excerpt,
  coverImage,
  category,
  accessLevel,
  createdAt,
  href,
  typeBadge,
}: BlogCardProps) {
  const date = new Date(createdAt).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link to={href ?? `/blog/${slug}`}>
      <Card className="group h-full overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {coverImage ? (
            <img src={coverImage} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-4xl font-bold opacity-20">SS</span>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {typeBadge && <Badge variant="outline" className="text-xs">{typeBadge}</Badge>}
            {category && <Badge variant="secondary" className="text-xs">{category}</Badge>}
            {accessLevel !== "public" && (
              <Badge variant="outline" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                {accessLevel === "premium" ? "Premium" : "Restrito"}
              </Badge>
            )}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {excerpt && <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
