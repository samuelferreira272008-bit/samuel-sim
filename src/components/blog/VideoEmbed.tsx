interface VideoEmbedProps {
  url: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Already an embed/iframe URL
  if (url.includes("embed") || url.includes("player")) return url;

  return null;
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-lg border border-border">
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video embed"
      />
    </div>
  );
}
