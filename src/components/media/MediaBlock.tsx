import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MediaBlockProps {
  /** Image URL (jpg/png/webp/gif) */
  imageUrl?: string | null;
  /** Video URL: direct mp4/webm OR YouTube/Vimeo */
  videoUrl?: string | null;
  /** Show transparent-bg checker pattern behind PNGs without background */
  transparent?: boolean;
  alt?: string;
  className?: string;
  /** aspect ratio class, e.g. "aspect-video", "aspect-square" */
  aspect?: string;
  /** object-fit (default cover; use contain for transparent assets/logos) */
  fit?: "cover" | "contain";
  rounded?: boolean;
}

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return null;
}

export function MediaBlock({
  imageUrl,
  videoUrl,
  transparent = false,
  alt = "",
  className,
  aspect = "aspect-video",
  fit = "cover",
  rounded = true,
}: MediaBlockProps) {
  const isDirectVideo = useMemo(
    () => !!videoUrl && /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(videoUrl),
    [videoUrl]
  );
  const embedUrl = useMemo(() => (videoUrl ? getEmbedUrl(videoUrl) : null), [videoUrl]);

  if (!imageUrl && !videoUrl) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border border-border/60",
        aspect,
        rounded && "rounded-2xl",
        transparent && "bg-checker",
        !transparent && "bg-muted",
        className
      )}
    >
      {videoUrl ? (
        isDirectVideo ? (
          <video
            src={videoUrl}
            className={cn("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")}
            autoPlay
            muted
            loop
            playsInline
            poster={imageUrl ?? undefined}
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={alt || "video"}
          />
        ) : (
          imageUrl && (
            <img
              src={imageUrl}
              alt={alt}
              className={cn("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")}
            />
          )
        )
      ) : (
        <img
          src={imageUrl!}
          alt={alt}
          loading="lazy"
          className={cn("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")}
        />
      )}
    </div>
  );
}
