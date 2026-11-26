import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe,
  Loader2,
  MessageCircle,
  Package,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSEO } from "@/lib/seo";
import { db, formatPrice, whatsappHref } from "@/lib/repo";
import { CURATED_PRODUCTS } from "@/lib/curatedContent";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { dispatchEvent } from "@/lib/events";
import { toast } from "sonner";

type PaymentMethod = "multicaixa" | "bai_direto" | "paypal";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: typeof Smartphone;
}> = [
  {
    id: "multicaixa",
    label: "Multicaixa Express",
    subtitle: "Transferência instantânea (AOA)",
    icon: Smartphone,
  },
  {
    id: "bai_direto",
    label: "BAI Direto",
    subtitle: "Pagamento nacional Angola (AOA)",
    icon: Building2,
  },
  {
    id: "paypal",
    label: "PayPal / Internacional",
    subtitle: "Pagamento em USD / EUR",
    icon: Globe,
  },
];

const typeLabels: Record<string, string> = {
  physical: "Produto físico",
  digital: "Serviço / Produto digital",
  template: "Template & Código",
  ebook: "Guia Digital (E-book)",
  course: "Curso Prático",
};

export default function ProdutoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [active, setActive] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("multicaixa");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [buyer, setBuyer] = useState({
    name: "",
    email: user?.email ?? "",
    phone: "",
    referenceNote: "",
  });

  const isUuid = UUID_RE.test(id ?? "");

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (isUuid) {
        const { data } = await db.from("products").select("*").eq("id", id).maybeSingle();
        if (data) return data;
      }
      return CURATED_PRODUCTS.find((item) => item.id === id) ?? null;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  const { data: checkoutInfo } = useQuery({
    queryKey: ["public-checkout-info"],
    queryFn: async () => {
      try {
        const { data } = await db.rpc("get_public_checkout_info");
        return Array.isArray(data) ? data[0] : data;
      } catch {
        return null;
      }
    },
  });

  const images = [p?.image_url, ...(p?.gallery ?? [])].filter(Boolean) as string[];
  const main = active ?? images[0];

  const meta = (p?.payment_metadata ?? {}) as {
    usd_price?: number;
    delivery?: string;
  };

  const [generatedReference, setGeneratedReference] = useState(
    () => `SS-${Math.abs((id ?? "PRD").split("").reduce((a, c) => a + c.charCodeAt(0), 0)).toString(36).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "https://samuel-sim.lovable.app";
  const canonicalUrl = p ? `${origin}/produtos/${p.id}` : undefined;

  useSEO({
    title: p ? `${p.name} — Samuel Simão` : "Produto — Samuel Simão",
    description: p?.description ?? "Produto disponível na vitrine oficial de Samuel Simão.",
    image: main,
    type: "product",
    breadcrumbs: p
      ? [
          { name: "Início", path: "/" },
          { name: "Produtos", path: "/produtos" },
          { name: p.name, path: `/produtos/${p.id}` },
        ]
      : undefined,
    jsonLd: p
      ? {
          "@type": "Product",
          name: p.name,
          description: p.description ?? "",
          image: images,
          brand: { "@type": "Brand", name: "Samuel Simão" },
          category: typeLabels[p.type] ?? "Produto digital",
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            price: String(p.price ?? 0),
            priceCurrency: p.currency ?? "AOA",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Person", name: "Samuel Simão" },
          },
        }
      : undefined,
  });

  if (isLoading)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  if (!p)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">
        Produto não encontrado.
      </div>
    );

  const methodLabel = PAYMENT_OPTIONS.find((m) => m.id === selectedMethod)?.label ?? selectedMethod;
  const usdPrice =
    meta.usd_price ?? (Number(p.price) > 0 ? Math.max(5, Math.round(Number(p.price) / 900)) : 0);
  const displayAmount =
    selectedMethod === "paypal" && usdPrice > 0
      ? `$${usdPrice} USD`
      : formatPrice(p.price, p.currency ?? "AOA");

  const waTarget = p.whatsapp_url || profile?.whatsapp || "+244955142515";
  const waQuick = whatsappHref(
    waTarget,
    `Olá Samuel! Tenho interesse em adquirir: ${p.name} (${displayAmount}) via ${methodLabel}.`,
  );

  const openCheckout = (method?: PaymentMethod) => {
    if (method) setSelectedMethod(method);
    setOrderRef(null);
    setGeneratedReference(
      `SS-${Math.abs((id ?? "PRD").split("").reduce((a, c) => a + c.charCodeAt(0), 0)).toString(36).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    );
    setBuyer((prev) => ({ ...prev, email: prev.email || user?.email || "" }));
    setCheckoutOpen(true);
    trackEvent("purchase_started", {
      product_id: p.id,
      product_name: p.name,
      payment_method: method ?? selectedMethod,
      amount: p.price,
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer.name.trim() || !buyer.email.trim()) {
      toast.error("Preenche o teu nome e email.");
      return;
    }

    setSubmitting(true);
    const ref = generatedReference;
    try {
      // 1. Always record inquiry/order cleanly in contact_messages
      const orderMessage = [
        `Pedido de Produto: ${p.name}`,
        `Referência: ${ref}`,
        `Método de Pagamento: ${methodLabel}`,
        `Valor: ${displayAmount}`,
        buyer.phone.trim() ? `Telemóvel / WhatsApp: ${buyer.phone.trim()}` : null,
        buyer.referenceNote.trim() ? `Notas / Referência de Comprovativo: ${buyer.referenceNote.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await db.from("contact_messages").insert({
        name: buyer.name.trim(),
        email: buyer.email.trim(),
        subject: `Encomenda [${ref}] — ${p.name} (${methodLabel})`,
        message: orderMessage,
      });

      // 2. If authenticated user ordering a persisted DB product, create pending purchase + manual review record
      if (user && UUID_RE.test(p.id)) {
        const { data: purchase } = await db
          .from("purchases")
          .insert({
            user_id: user.id,
            product_id: p.id,
            amount: Number(p.price || 0),
            status: "pending",
          })
          .select("id")
          .maybeSingle();

        if (purchase?.id && (selectedMethod === "multicaixa" || selectedMethod === "bai_direto")) {
          await db.from("manual_payment_reviews").insert({
            purchase_id: purchase.id,
            user_id: user.id,
            expected_amount: Number(p.price || 0),
            expected_reference: ref,
            detected_reference: buyer.referenceNote.trim() || null,
            status: "pending",
            extracted_data: {
              payment_method: selectedMethod,
              buyer_email: buyer.email.trim(),
              buyer_phone: buyer.phone.trim() || null,
            },
          });
        }
      }

      await dispatchEvent("order_created", {
        reference: ref,
        product_id: p.id,
        product_name: p.name,
        payment_method: selectedMethod,
        amount: displayAmount,
        email: buyer.email.trim(),
      });

      await trackEvent("payment_pending", {
        reference: ref,
        product_id: p.id,
        payment_method: selectedMethod,
      });

      setOrderRef(ref);
      toast.success("Pedido registado! Conclui o envio do comprovativo para ativação.");
    } catch {
      toast.error("Não foi possível registar agora. Clica para confirmar diretamente via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const waOrderConfirm = whatsappHref(
    waTarget,
    `Olá Samuel! Registei o pedido [${orderRef ?? generatedReference}] para "${p.name}". Método: ${methodLabel} · Valor: ${displayAmount}. Nome: ${buyer.name || "Cliente"}.`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/produtos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Produtos
      </Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted">
            {main ? (
              <img src={main} alt={p.name} decoding="async" fetchPriority="high" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(src)}
                  className={`aspect-square overflow-hidden rounded-md border ${
                    src === main ? "border-foreground" : "border-border"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Badge variant="secondary">{typeLabels[p.type] ?? "Produto digital"}</Badge>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">{p.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(p.price, p.currency ?? "AOA")}
            </p>
            {usdPrice > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                (~${usdPrice} USD via PayPal)
              </span>
            )}
          </div>

          {p.description && (
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
              {p.description}
            </p>
          )}

          {meta.delivery && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-3.5 py-2 text-xs text-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{meta.delivery}</span>
            </div>
          )}

          {/* Interactive Payment Method Selector */}
          <div className="mt-7 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Escolhe como pagar
            </p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const activeOpt = selectedMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMethod(opt.id)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      activeOpt
                        ? "border-foreground bg-secondary shadow-xs"
                        : "border-border/70 bg-card/50 hover:border-foreground/40"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-foreground mb-1.5" />
                    <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {opt.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => openCheckout(selectedMethod)} className="rounded-xl font-semibold">
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar com {methodLabel}
            </Button>
            {p.checkout_url && (
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <a href={p.checkout_url} target="_blank" rel="noopener noreferrer">
                  Checkout Externo <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            {waQuick && (
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <a href={waQuick} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Pedir pelo WhatsApp
                </a>
              </Button>
            )}
          </div>
          {!p.checkout_url && !waQuick && (
            <p className="mt-4 text-sm text-muted-foreground">
              Contacta-me para encomendar este produto.
            </p>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Finalizar Pedido — {methodLabel}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {p.name} · <strong className="text-foreground">{displayAmount}</strong>
            </DialogDescription>
          </DialogHeader>

          {orderRef ? (
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-border bg-secondary/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Pedido registado com sucesso</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Referência do teu pedido:{" "}
                  <strong className="font-mono text-foreground">{orderRef}</strong>
                </p>
                {(selectedMethod === "multicaixa" || selectedMethod === "bai_direto") && (
                  <div className="mt-2 rounded-xl border border-border bg-background p-3 text-xs space-y-1">
                    {checkoutInfo?.payment_iban ? (
                      <>
                        <p className="font-semibold text-foreground">Dados para Transferência (Angola):</p>
                        <p className="font-mono text-foreground">IBAN: {checkoutInfo.payment_iban}</p>
                        {checkoutInfo.payment_account_name && (
                          <p className="text-muted-foreground">
                            Titular: {checkoutInfo.payment_account_name}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        Envia uma mensagem no WhatsApp com a referência acima para receberes o meu IBAN atualizado na hora e ativar o teu acesso.
                      </p>
                    )}
                  </div>
                )}
                {selectedMethod === "paypal" && (
                  <p className="text-xs text-muted-foreground">
                    {p.checkout_url
                      ? "Clica abaixo para concluir diretamente via PayPal ou envia confirmação pelo WhatsApp."
                      : "Vou enviar-te o link oficial de pagamento PayPal para o teu email/WhatsApp com esta referência."}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {waOrderConfirm && (
                  <Button asChild className="flex-1">
                    <a href={waOrderConfirm} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Enviar Comprovativo / Confirmar no WhatsApp
                    </a>
                  </Button>
                )}
                {selectedMethod === "paypal" && p.checkout_url && (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={p.checkout_url} target="_blank" rel="noopener noreferrer">
                      Ir para PayPal <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1">
                {selectedMethod === "multicaixa" && (
                  <p>
                    Pagas <strong className="text-foreground">{displayAmount}</strong> por transferência Multicaixa Express com a referência{" "}
                    <strong className="font-mono text-foreground">{generatedReference}</strong>.
                  </p>
                )}
                {selectedMethod === "bai_direto" && (
                  <p>
                    Pagas <strong className="text-foreground">{displayAmount}</strong> via transferência imediata BAI Direto usando a referência{" "}
                    <strong className="font-mono text-foreground">{generatedReference}</strong>.
                  </p>
                )}
                {selectedMethod === "paypal" && (
                  <p>
                    Valor internacional equivalente: <strong className="text-foreground">{displayAmount}</strong>. Ao confirmar, recebes o link direto PayPal com a referência{" "}
                    <strong className="font-mono text-foreground">{generatedReference}</strong>.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="buyer-name" className="text-xs">O teu nome</Label>
                  <Input
                    id="buyer-name"
                    required
                    placeholder="Ex: António Manuel"
                    value={buyer.name}
                    onChange={(e) => setBuyer((b) => ({ ...b, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-email" className="text-xs">O teu email</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    required
                    placeholder="nome@exemplo.com"
                    value={buyer.email}
                    onChange={(e) => setBuyer((b) => ({ ...b, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buyer-phone" className="text-xs">WhatsApp / Telemóvel (para entrega rápida)</Label>
                <Input
                  id="buyer-phone"
                  placeholder="+244 9xx xxx xxx"
                  value={buyer.phone}
                  onChange={(e) => setBuyer((b) => ({ ...b, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="buyer-note" className="text-xs">
                  {selectedMethod === "paypal"
                    ? "Notas ou email PayPal (opcional)"
                    : "Nº de referência / operação do comprovativo (opcional)"}
                </Label>
                <Textarea
                  id="buyer-note"
                  rows={2}
                  placeholder="Se já fizeste a transferência, indica aqui a referência..."
                  value={buyer.referenceNote}
                  onChange={(e) => setBuyer((b) => ({ ...b, referenceNote: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "A registar pedido..." : "Confirmar Pedido"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
