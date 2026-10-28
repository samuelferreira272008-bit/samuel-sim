import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
  ShieldCheck,
  Building2,
  Users,
  Heart,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSEO } from "@/lib/seo";
import { db, whatsappHref } from "@/lib/repo";
import { dispatchEvent } from "@/lib/events";
import { toast } from "sonner";

type Cadence = "monthly" | "annual";
type Currency = "AOA" | "EUR" | "USD";

interface TierPlan {
  id: "bronze" | "silver" | "gold";
  name: string;
  tagline: string;
  audience: string;
  popular?: boolean;
  prices: {
    AOA: { monthly: number; annual: number; formattedMonthly: string; formattedAnnual: string };
    EUR: { monthly: number; annual: number; formattedMonthly: string; formattedAnnual: string };
    USD: { monthly: number; annual: number; formattedMonthly: string; formattedAnnual: string };
  };
  highlightPerks: string[];
  ctaText: string;
}

const PLANS: TierPlan[] = [
  {
    id: "bronze",
    name: "Bronze",
    tagline: "Apoio de Comunidade",
    audience: "Ideal para entusiastas, estudantes e membros que desejam incentivar a produção contínua de conteúdo livre.",
    prices: {
      AOA: { monthly: 5000, annual: 50000, formattedMonthly: "5.000 Kz", formattedAnnual: "50.000 Kz" },
      EUR: { monthly: 5, annual: 50, formattedMonthly: "5 €", formattedAnnual: "50 €" },
      USD: { monthly: 6, annual: 60, formattedMonthly: "$6", formattedAnnual: "$60" },
    },
    highlightPerks: [
      "Acesso ao canal exclusivo de apoiantes (Telegram / Discord)",
      "Menção nominal mensal nos agradecimentos do Blog e Newsletter",
      "Emblema digital de Apoiante Bronze no perfil da plataforma",
      "Acesso antecipado de 24h a novos artigos e notas técnicas",
    ],
    ctaText: "Aderir ao Bronze",
  },
  {
    id: "silver",
    name: "Prata",
    tagline: "Criador & Profissional",
    audience: "Para desenvolvedores, freelancers e criadores que utilizam as ferramentas e querem acelerar projetos com suporte prioritário.",
    popular: true,
    prices: {
      AOA: { monthly: 15000, annual: 150000, formattedMonthly: "15.000 Kz", formattedAnnual: "150.000 Kz" },
      EUR: { monthly: 15, annual: 150, formattedMonthly: "15 €", formattedAnnual: "150 €" },
      USD: { monthly: 18, annual: 180, formattedMonthly: "$18", formattedAnnual: "$180" },
    },
    highlightPerks: [
      "Todos os benefícios do plano Bronze",
      "Acesso antecipado a todos os lançamentos de software, apps e templates",
      "Votação prioritária nas próximas ferramentas e protótipos do Lab",
      "20% de desconto em qualquer produto ou curso da loja",
      "Canal direto para dúvidas de código e revisão de arquitetura",
    ],
    ctaText: "Escolher Plano Prata",
  },
  {
    id: "gold",
    name: "Ouro",
    tagline: "Empresa & Mecenas",
    audience: "Para empresas, agências e líderes de tecnologia que procuram mentoria estratégica direta e visibilidade institucional.",
    prices: {
      AOA: { monthly: 50000, annual: 500000, formattedMonthly: "50.000 Kz", formattedAnnual: "500.000 Kz" },
      EUR: { monthly: 50, annual: 500, formattedMonthly: "50 €", formattedAnnual: "500 €" },
      USD: { monthly: 60, annual: 600, formattedMonthly: "$60", formattedAnnual: "$600" },
    },
    highlightPerks: [
      "Todos os benefícios dos planos Bronze e Prata",
      "1 sessão privada 1:1 de consultoria técnica ou mentoria por trimestre (60 min)",
      "Logótipo da sua empresa ou marca com link de destaque na plataforma",
      "Revisão técnica de 1 projeto ou codebase por semestre",
      "Certificado formal de Patrocinador Oficial e emissão de recibo comercial",
    ],
    ctaText: "Patrocinar com Ouro",
  },
];

interface ComparisonRow {
  name: string;
  category: string;
  tooltip?: string;
  bronze: string | boolean;
  silver: string | boolean;
  gold: string | boolean;
}

const COMPARISON_MATRIX: ComparisonRow[] = [
  // Categoria: Comunidade & Reconhecimento
  { category: "Comunidade & Reconhecimento", name: "Canal VIP de Apoiantes", bronze: true, silver: true, gold: true },
  { category: "Comunidade & Reconhecimento", name: "Agradecimentos no Blog & Newsletter", bronze: "Mensal", silver: "Destaque", gold: "Destaque Principal" },
  { category: "Comunidade & Reconhecimento", name: "Emblema exclusivo no perfil", bronze: "Bronze", silver: "Prata VIP", gold: "Ouro Mecenas" },
  { category: "Comunidade & Reconhecimento", name: "Logo e link da sua empresa no site", bronze: false, silver: false, gold: true },
  // Categoria: Conteúdos & Ferramentas
  { category: "Conteúdos & Ferramentas", name: "Acesso antecipado a artigos e ensaios", bronze: "24h antes", silver: "48h antes", gold: "Imediato (Drafts)" },
  { category: "Conteúdos & Ferramentas", name: "Download de templates e boilerplates", bronze: "Parcial", silver: "Completo", gold: "Completo + Suporte" },
  { category: "Conteúdos & Ferramentas", name: "Votação de prioridade nos projetos do Lab", bronze: false, silver: true, gold: true },
  { category: "Conteúdos & Ferramentas", name: "Desconto na loja de produtos e cursos", bronze: "5%", silver: "20%", gold: "35%" },
  // Categoria: Mentoria & Consultoria Direta
  { category: "Mentoria & Consultoria", name: "Canal direto de dúvidas técnicas", bronze: false, silver: "Grupo restrito", gold: "Acesso direto 1:1" },
  { category: "Mentoria & Consultoria", name: "Sessão privada de mentoria / consultoria", bronze: false, silver: false, gold: "1x por trimestre (60m)" },
  { category: "Mentoria & Consultoria", name: "Auditoria / Code Review de projetos", bronze: false, silver: false, gold: "1x por semestre" },
  { category: "Mentoria & Consultoria", name: "Emissão de Fatura / Recibo para Empresas", bronze: true, silver: true, gold: true },
];

const FAQS = [
  {
    q: "Quais são os métodos de pagamento aceites?",
    a: "Em Angola aceitamos transferência bancária direta (com envio de comprovativo via Multicaixa Express / IBAN angolano). Para apoiantes no exterior, aceitamos pagamentos via Cartão Internacional, PayPal ou transferência SEPA (EUR / USD).",
  },
  {
    q: "Como é ativado o meu plano após o pagamento?",
    a: "A ativação é imediata após a confirmação. O teu utilizador na plataforma recebe o respetivo emblema de apoiante, acesso às secções privadas do Lab e o link de convite para os canais de apoiantes.",
  },
  {
    q: "Posso cancelar ou alterar o meu plano quando quiser?",
    a: "Sim, sem qualquer fidelização. Podes subir de nível (upgrade), descer ou pausar o teu patrocínio a qualquer momento entrando em contacto direto comigo.",
  },
  {
    q: "Empresas e marcas recebem fatura/recibo?",
    a: "Sim. Para o plano Ouro ou contribuições empresariais, emitimos fatura e recibo comercial para despesas de apoio institucional e patrocínio.",
  },
  {
    q: "Para onde vai o valor das contribuições?",
    a: "O valor é 100% reinvestido na infraestrutura da plataforma (servidores Supabase, domínio, licenças), na aquisição de hardware de teste no Lab e no tempo dedicado à criação de tutoriais e código livre em português.",
  },
];

export default function Patrocinar() {
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [currency, setCurrency] = useState<Currency>("AOA");
  const [selectedPlan, setSelectedPlan] = useState<TierPlan | null>(null);
  const [sponsorFilter, setSponsorFilter] = useState<string>("all");
  const [mobileCompareTier, setMobileCompareTier] = useState<"bronze" | "silver" | "gold">("silver");

  // Form inside modal
  const [modalForm, setModalForm] = useState({ name: "", email: "", notes: "" });
  const [submittingModal, setSubmittingModal] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  const { data: settings } = useQuery({
    queryKey: ["sponsorship_message"],
    queryFn: async () => {
      const { data } = await db
        .from("platform_settings")
        .select("sponsorship_message")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: sponsors = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data } = await db
        .from("sponsors")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  useSEO({
    title: "Planos & Patrocínio — Samuel Simão",
    description:
      "Apoia a criação independente de tecnologia, software livre e formação. Compara os planos de patrocínio e escolhe o melhor nível de apoio.",
  });

  const filteredSponsors = sponsors.filter((s: any) =>
    sponsorFilter === "all" ? true : s.tier?.toLowerCase() === sponsorFilter.toLowerCase(),
  );

  const handleOpenPlan = (plan: TierPlan) => {
    setSelectedPlan(plan);
  };

  const getWhatsAppMessageForPlan = (plan: TierPlan) => {
    const priceStr =
      cadence === "monthly"
        ? `${plan.prices[currency].formattedMonthly}/mês`
        : `${plan.prices[currency].formattedAnnual}/ano`;
    return `Olá Samuel! Gostaria de aderir ao plano de patrocínio ${plan.name} (${cadence === "monthly" ? "Mensal" : "Anual"} — ${priceStr}). Como posso efetuar o pagamento e ativar os meus acessos?`;
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (!modalForm.name.trim() || !modalForm.email.trim()) {
      toast.error("Por favor preenche o teu nome e email.");
      return;
    }

    setSubmittingModal(true);
    const priceStr =
      cadence === "monthly"
        ? `${selectedPlan.prices[currency].formattedMonthly}/mês`
        : `${selectedPlan.prices[currency].formattedAnnual}/ano`;

    const payload = {
      name: modalForm.name.trim(),
      email: modalForm.email.trim(),
      subject: `Adesão ao Plano ${selectedPlan.name} (${cadence === "monthly" ? "Mensal" : "Anual"})`,
      message: `Interesse no plano ${selectedPlan.name} (${priceStr}).\nNotas do apoiante: ${modalForm.notes.trim() || "Nenhuma nota adicional."}`,
    };

    try {
      const { error } = await db.from("contact_messages").insert(payload);
      await dispatchEvent("sponsorship_inquiry", {
        tier: selectedPlan.id,
        cadence,
        currency,
        email: modalForm.email,
      });

      if (error) {
        // Fallback to mailto
        const contactEmail = profile?.contact_email?.trim() || "samuelgarcia.272008@gmail.com";
        const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} (${payload.email})`);
        window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(payload.subject)}&body=${body}`;
      }

      toast.success("Pedido registado! Entrarei em contacto dentro de poucas horas com as instruções de adesão.");
      setSelectedPlan(null);
      setModalForm({ name: "", email: "", notes: "" });
    } catch {
      toast.error("Erro ao enviar o pedido. Podes também falar diretamente pelo WhatsApp.");
    } finally {
      setSubmittingModal(false);
    }
  };

  // Group comparison matrix by category
  const categories = Array.from(new Set(COMPARISON_MATRIX.map((r) => r.category)));

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background subtle ambient mesh */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-foreground/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Apoio & Parcerias
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Planos de Patrocínio & Apoio
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {settings?.sponsorship_message ??
              "O teu apoio sustenta a criação de ferramentas livres, cursos gratuitos e ecossistemas abertos para a comunidade de tecnologia em Angola e no mundo."}
          </p>

          {/* Interactive Controls Bar: Cadence & Currency */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {/* Cadence switch */}
            <div className="inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setCadence("monthly")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  cadence === "monthly"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Faturação Mensal
              </button>
              <button
                type="button"
                onClick={() => setCadence("annual")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  cadence === "annual"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Faturação Anual</span>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                    cadence === "annual" ? "bg-background/20 text-background" : "bg-muted text-foreground"
                  }`}
                >
                  Poupe ~17%
                </span>
              </button>
            </div>

            {/* Currency selector */}
            <div className="inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
              {(["AOA", "EUR", "USD"] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    currency === cur
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-foreground/80" />
            <span>Sem fidelização · Pagamento seguro por Multicaixa Express, IBAN ou PayPal</span>
          </div>
        </div>

        {/* Pricing Cards Grid with Distinct Hierarchy */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan) => {
            const isPopular = plan.popular;
            const priceData = plan.prices[currency];
            const priceDisplay =
              cadence === "monthly" ? priceData.formattedMonthly : priceData.formattedAnnual;
            const periodLabel = cadence === "monthly" ? "/mês" : "/ano";
            const perMonthEquivalent =
              cadence === "annual"
                ? `Equivalente a ${(priceData.annual / 12).toLocaleString("pt-AO", {
                    maximumFractionDigits: 0,
                  })} ${currency}/mês`
                : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`relative flex flex-col justify-between rounded-3xl border transition-all duration-300 ${
                  isPopular
                    ? "border-foreground bg-card shadow-glow ring-1 ring-foreground/20 lg:-translate-y-3 z-10"
                    : "border-border/80 bg-card/60 hover:border-foreground/40 hover:bg-card"
                }`}
              >
                {/* Popular Banner */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-foreground/30 bg-foreground px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-background shadow-md">
                    Mais Escolhido · Criador
                  </div>
                )}

                <div className="p-8 sm:p-10">
                  {/* Plan Identification */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">{plan.name}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </div>
                    {isPopular && (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
                        <Sparkles className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground min-h-[40px]">
                    {plan.audience}
                  </p>

                  {/* Price Box */}
                  <div className="mt-6 border-y border-border/60 py-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-5xl">
                        {priceDisplay}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">{periodLabel}</span>
                    </div>
                    {perMonthEquivalent && (
                      <p className="mt-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                        {perMonthEquivalent} · 2 meses gratuitos
                      </p>
                    )}
                  </div>

                  {/* Key Perks */}
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      O que está incluído:
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                      {plan.highlightPerks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-4 w-4 shrink-0 text-foreground mt-0.5" />
                          <span className="leading-snug text-foreground/90">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-8 pt-0 sm:p-10 sm:pt-0">
                  <Button
                    type="button"
                    onClick={() => handleOpenPlan(plan)}
                    variant={isPopular ? "default" : "outline"}
                    size="lg"
                    className={`w-full font-semibold transition-all ${
                      isPopular
                        ? "shadow-glow hover:scale-[1.01]"
                        : "hover:border-foreground hover:bg-foreground hover:text-background"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Feature Comparison Matrix */}
        {/* Detailed Feature Comparison Matrix */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Comparação Lado a Lado
            </p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Tudo o que precisas saber em detalhe
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Vê exatamente como os benefícios evoluem em cada nível de patrocínio.
            </p>
          </div>

          {/* MOBILE VIEW (< md): Segmented Tabs + Stacked Category Cards */}
          <div className="mt-8 md:hidden">
            {/* Tier Switcher for Mobile */}
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileCompareTier("bronze")}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  mobileCompareTier === "bronze"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bronze
              </button>
              <button
                type="button"
                onClick={() => setMobileCompareTier("silver")}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  mobileCompareTier === "silver"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Prata ★
              </button>
              <button
                type="button"
                onClick={() => setMobileCompareTier("gold")}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  mobileCompareTier === "gold"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ouro
              </button>
            </div>

            {/* Content for Selected Tier */}
            <div className="mt-4 space-y-4">
              {categories.map((category) => (
                <div key={category} className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="bg-secondary/60 px-4 py-2.5 border-b border-border text-xs font-bold uppercase tracking-wider text-foreground">
                    {category}
                  </div>
                  <div className="divide-y divide-border/60 p-2">
                    {COMPARISON_MATRIX.filter((r) => r.category === category).map((row, idx) => {
                      const val = row[mobileCompareTier];
                      return (
                        <div key={idx} className="flex items-center justify-between p-2.5 gap-3">
                          <span className="text-xs sm:text-sm font-medium text-foreground leading-snug">
                            {row.name}
                          </span>
                          <span className="shrink-0">
                            {typeof val === "boolean" ? (
                              val ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/30">
                                  <Minus className="h-3.5 w-3.5" />
                                </span>
                              )
                            ) : (
                              <span className="rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-foreground">
                                {val}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP VIEW (>= md): Full Comparative Table */}
          <div className="hidden md:block mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="py-4 px-6 text-sm font-semibold text-foreground w-2/5">
                      Benefício / Recurso
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-bold text-foreground w-1/5">
                      Bronze
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-bold text-foreground w-1/5 bg-foreground/5">
                      Prata (Recomendado)
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-bold text-foreground w-1/5">
                      Ouro (Mecenas)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {categories.map((category) => (
                    <div key={category} className="contents">
                      <tr className="bg-muted/40">
                        <td
                          colSpan={4}
                          className="py-2.5 px-6 text-xs font-bold uppercase tracking-wider text-foreground"
                        >
                          {category}
                        </td>
                      </tr>
                      {COMPARISON_MATRIX.filter((r) => r.category === category).map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-6 font-medium text-foreground">{row.name}</td>

                          {/* Bronze column */}
                          <td className="py-3.5 px-4 text-center text-muted-foreground">
                            {typeof row.bronze === "boolean" ? (
                              row.bronze ? (
                                <Check className="mx-auto h-4 w-4 text-foreground" />
                              ) : (
                                <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-xs font-semibold text-foreground">{row.bronze}</span>
                            )}
                          </td>

                          {/* Silver column */}
                          <td className="py-3.5 px-4 text-center bg-foreground/[0.02]">
                            {typeof row.silver === "boolean" ? (
                              row.silver ? (
                                <Check className="mx-auto h-4 w-4 text-foreground" />
                              ) : (
                                <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-xs font-semibold text-foreground">{row.silver}</span>
                            )}
                          </td>

                          {/* Gold column */}
                          <td className="py-3.5 px-4 text-center text-muted-foreground">
                            {typeof row.gold === "boolean" ? (
                              row.gold ? (
                                <Check className="mx-auto h-4 w-4 text-foreground" />
                              ) : (
                                <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-xs font-semibold text-foreground">{row.gold}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </div>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Current Sponsors Section (Social Proof) */}
        <section className="mt-28">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Comunidade Ativa
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Apoiantes & Patrocinadores
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1">
              {[
                { key: "all", label: "Todos" },
                { key: "gold", label: "Ouro" },
                { key: "silver", label: "Prata" },
                { key: "bronze", label: "Bronze" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSponsorFilter(f.key)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    sponsorFilter === f.key
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {isLoadingSponsors ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredSponsors.length === 0 ? (
              <Card className="border-dashed border-border bg-card/40">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    Sê o primeiro apoiante deste ciclo!
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                    O teu nome e logótipo aparecerão aqui com destaque permanente, celebrando a tua contribuição para a tecnologia independente.
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleOpenPlan(PLANS[1])}
                    size="sm"
                    className="mt-6"
                  >
                    Tornar-me Apoiante
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredSponsors.map((s: any) => (
                  <Card
                    key={s.id}
                    className="group border-border/70 bg-card transition-all hover:border-foreground/50 hover:shadow-sm"
                  >
                    <CardContent className="flex items-center gap-3.5 p-4">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={s.avatar_url ?? undefined} alt={s.name} />
                        <AvatarFallback className="font-semibold text-xs">
                          {s.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        {s.link ? (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline truncate max-w-full"
                          >
                            <span className="truncate">{s.name}</span>
                            <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                        )}
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Plano {s.tier ?? "Apoiante"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mt-28 mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Dúvidas Frequentes
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Perguntas & Respostas
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-10 w-full space-y-3">
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="rounded-2xl border border-border bg-card px-5"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA Bar */}
        <div className="mt-24 rounded-3xl border border-border bg-secondary/60 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Precisas de uma proposta personalizada para a tua empresa?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Se procuras patrocínio institucional de eventos, formações corporativas fechadas ou desenvolvimento de soluções dedicadas no Lab, entra em contacto direto.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/contacto">
                Falar com Samuel Simão <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {profile?.whatsapp && (
              <Button asChild variant="outline" size="lg" className="border-border">
                <a
                  href={whatsappHref(
                    profile.whatsapp,
                    "Olá Samuel! Gostaria de conversar sobre uma proposta de patrocínio institucional para a minha empresa.",
                  )!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Conversar no WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Plan Selection Modal / Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        {selectedPlan && (
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-foreground text-background px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  Plano {selectedPlan.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cadence === "monthly" ? "Mensal" : "Anual (com desconto)"}
                </span>
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground mt-2">
                Aderir ao Plano {selectedPlan.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Valor:{" "}
                <strong className="text-foreground font-semibold">
                  {cadence === "monthly"
                    ? `${selectedPlan.prices[currency].formattedMonthly}/mês`
                    : `${selectedPlan.prices[currency].formattedAnnual}/ano`}
                </strong>
                . Escolhe como preferes finalizar a tua adesão:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Option 1: Direct WhatsApp (Fastest) */}
              <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-foreground text-background p-2 shrink-0">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      Finalizar Instantaneamente via WhatsApp
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Recebe os dados bancários (Multicaixa Express / IBAN / PayPal) e ativa o teu acesso em poucos minutos diretamente comigo.
                    </p>
                    <Button
                      asChild
                      className="mt-3 w-full font-semibold"
                      size="sm"
                    >
                      <a
                        href={
                          whatsappHref(
                            profile?.whatsapp ?? "244923000000",
                            getWhatsAppMessageForPlan(selectedPlan),
                          ) ||
                          `https://wa.me/?text=${encodeURIComponent(
                            getWhatsAppMessageForPlan(selectedPlan),
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> Continuar no WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Option 2: Request via Internal Message Form */}
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4 text-foreground" />
                  <h3 className="text-sm font-bold text-foreground">
                    Ou Envia um Pedido por Email
                  </h3>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="m-name" className="text-xs">
                      O teu Nome
                    </Label>
                    <Input
                      id="m-name"
                      required
                      placeholder="Ex: João da Silva"
                      value={modalForm.name}
                      onChange={(e) => setModalForm((f) => ({ ...f, name: e.target.value }))}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="m-email" className="text-xs">
                      O teu Email
                    </Label>
                    <Input
                      id="m-email"
                      type="email"
                      required
                      placeholder="exemplo@dominio.com"
                      value={modalForm.email}
                      onChange={(e) => setModalForm((f) => ({ ...f, email: e.target.value }))}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="m-notes" className="text-xs">
                      Notas ou link da tua empresa (opcional)
                    </Label>
                    <Textarea
                      id="m-notes"
                      rows={2}
                      placeholder="Alguma dúvida ou especificação..."
                      value={modalForm.notes}
                      onChange={(e) => setModalForm((f) => ({ ...f, notes: e.target.value }))}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full mt-2"
                    disabled={submittingModal}
                  >
                    {submittingModal ? "A registar pedido..." : "Enviar Pedido de Adesão"}
                  </Button>
                </form>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
