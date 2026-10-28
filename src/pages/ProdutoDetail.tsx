import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/lib/seo";
import { db, formatPrice, whatsappHref } from "@/lib/repo";

export default function ProdutoDetail() {
  const { id } = useParams();
  const [active, setActive] = useState<string | null>(null);
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => (await db.from("products").select("*").eq("id", id).maybeSingle()).data,
  });
  const images = [p?.image_url, ...(p?.gallery ?? [])].filter(Boolean) as string[];
  const main = active ?? images[0];

  useSEO({
    title: p ? `${p.name} — Samuel Simão` : "Produto — Samuel Simão",
    description: p?.description ?? "Produto disponível na vitrine oficial de Samuel Simão.",
    image: main,
    type: "product",
    jsonLd: p
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.description ?? "",
          image: images,
          offers: {
            "@type": "Offer",
            price: String(p.price ?? 0),
            priceCurrency: p.currency ?? "AOA",
            availability: "https://schema.org/InStock",
          },
        }
      : undefined,
  });

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-16"><Skeleton className="h-96 rounded-xl" /></div>;
  if (!p) return <div className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">Produto não encontrado.</div>;

  const wa = whatsappHref(p.whatsapp_url, `Olá! Tenho interesse no produto: ${p.name}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/produtos" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Produtos
      </Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted">
            {main ? <img src={main} alt={p.name} className="h-full w-full object-cover" /> :
              <div className="flex h-full items-center justify-center"><Package className="h-12 w-12 text-muted-foreground" /></div>}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((src) => (
                <button key={src} onClick={() => setActive(src)} className={`aspect-square overflow-hidden rounded-md border ${src === main ? "border-foreground" : "border-border"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <Badge variant="secondary">{p.type === "physical" ? "Produto físico" : "Produto digital"}</Badge>
          <h1 className="mt-3 text-4xl font-bold text-foreground">{p.name}</h1>
          <p className="mt-4 text-3xl font-bold text-foreground">{formatPrice(p.price, p.currency ?? "AOA")}</p>
          {p.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{p.description}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {p.checkout_url && (
              <Button size="lg" asChild>
                <a href={p.checkout_url} target="_blank" rel="noopener noreferrer">Comprar <ExternalLink className="ml-2 h-4 w-4" /></a>
              </Button>
            )}
            {wa && (
              <Button size="lg" variant={p.checkout_url ? "outline" : "default"} asChild>
                <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> Pedir pelo WhatsApp</a>
              </Button>
            )}
            {!p.checkout_url && !wa && <p className="text-sm text-muted-foreground">Contacta-nos para encomendar este produto.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
