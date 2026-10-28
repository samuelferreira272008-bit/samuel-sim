import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Sparkles,
  Code2,
  FlaskConical,
  BookOpen,
  Wrench,
  Users,
  MapPin,
  Building2,
  Globe,
  MessageCircle,
  Package,
  AppWindow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/lib/seo";
import { HeroBubblesBackground } from "@/components/visuals/HeroScene";
import { AnimatedText } from "@/components/visuals/AnimatedText";
import { GlowCard } from "@/components/visuals/GlowCard";
import { Marquee } from "@/components/visuals/Marquee";
import { db, whatsappHref } from "@/lib/repo";

const features = [
  { icon: AppWindow, title: "Apps & Programas", desc: "Aplicações e softwares prontos para usar ou transferir.", to: "/apps" },
  { icon: Code2, title: "Projetos", desc: "Produtos e experiências digitais que construo em público.", to: "/projetos" },
  { icon: Package, title: "Produtos", desc: "Vitrine de produtos físicos e digitais exclusivos.", to: "/produtos" },
  { icon: Wrench, title: "Ferramentas", desc: "Coleção curada de tools que uso e recomendo.", to: "/ferramentas" },
  { icon: FlaskConical, title: "Lab", desc: "Protótipos, ideias loucas e experiências em curso.", to: "/lab" },
  { icon: BookOpen, title: "Blog", desc: "Artigos, tutoriais e reflexões sobre tecnologia.", to: "/blog" },
  { icon: Building2, title: "Empresas", desc: "Negócios, marcas e organizações que desenvolvo.", to: "/empresas" },
  { icon: Users, title: "Comunidade", desc: "Junta-te à conversa e cresce com mais criadores.", to: "/comunidade" },
  { icon: Sparkles, title: "Lab AI", desc: "Assistente inteligente para te guiar na plataforma.", to: "/assistente" },
];

const tags = ["React", "TypeScript", "Supabase", "Liquid Glass", "Design", "AI", "Tailwind", "Educação", "Open source", "Angola"];

const socialLabels: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "X",
  tiktok: "TikTok",
  facebook: "Facebook",
  website: "Website",
};

export default function Home() {
  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  const fullName: string = profile?.full_name?.trim() || "Samuel Simão";
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "Samuel";
  const restName = nameParts.slice(1).join(" ") || "Simão";

  const headline: string = profile?.headline?.trim() || "Criador · Developer · Educador";
  const bioSummary: string = profile?.bio?.trim()
    ? profile.bio
        .replace(/[#*_>`~-]/g, "")
        .split(/\n+/)
        .filter(Boolean)[0]
        ?.slice(0, 280) ?? ""
    : "A construir ferramentas, conteúdo e comunidade. Bem-vindo ao meu ecossistema digital — onde partilho projetos, ideias e recursos para quem quer crescer na tecnologia.";

  const waLink = whatsappHref(profile?.whatsapp, `Olá ${fullName}!`);

  const socialEntries = Object.entries(profile?.social_links ?? {}).filter(
    ([, url]) => typeof url === "string" && url.trim().length > 0,
  ) as [string, string][];

  useSEO({
    title: `${fullName} — ${headline}`,
    description: bioSummary,
  });

  return (
    <>
      {/* Hero with full-bleed responsive Monochrome Liquid Glass Bubbles */}
      <section className="relative overflow-hidden bg-background">
        {/* Full-Section Responsive Monochrome Bubbles & Interactive Dot-Matrix Background */}
        <HeroBubblesBackground />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 sm:py-20 lg:py-32">
          <div className="flex flex-col items-start">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground sm:text-sm"
            >
              {headline}
            </motion.p>

            <h1 className="mt-4 text-4xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground break-words">
              <AnimatedText text={firstName} />{" "}
              <span className="text-gradient bg-[length:200%_auto] animate-gradient-shift">
                <AnimatedText text={restName} delay={0.18} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl"
            >
              {bioSummary}
            </motion.p>

            {/* Quick Socials & Location from Sobre Mim */}
            {(profile?.location || socialEntries.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="mt-6 flex flex-wrap items-center gap-2"
              >
                {profile?.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                    <MapPin className="h-3.5 w-3.5 text-foreground" />
                    {profile.location}
                  </span>
                )}
                {socialEntries.slice(0, 5).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground backdrop-blur"
                  >
                    <Globe className="h-3 w-3" />
                    {socialLabels[key] ?? key}
                  </a>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row w-full sm:w-auto gap-3"
            >
              <Button asChild size="lg" className="hover-scale shadow-glow w-full sm:w-auto min-h-[44px]">
                <Link to="/projetos">
                  Ver Projetos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover-scale glass w-full sm:w-auto min-h-[44px]">
                <Link to="/sobre">Sobre Mim</Link>
              </Button>
              {waLink ? (
                <Button asChild variant="secondary" size="lg" className="hover-scale border border-border w-full sm:w-auto min-h-[44px]">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="lg" className="hover-scale border border-border w-full sm:w-auto min-h-[44px]">
                  <Link to="/contacto">
                    <Mail className="mr-2 h-4 w-4" /> Contacto
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tag marquee */}
      <section className="border-y border-border bg-secondary py-6">
        <Marquee>
          {tags.map((t, i) => (
            <span key={i} className="text-2xl font-bold tracking-tight text-foreground/75">
              {t} <span className="mx-6 text-foreground">●</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Features grid */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Explora</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Um ecossistema completo
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tudo num só sítio: aprende, constrói, partilha e conecta-te.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link to={f.to} className="block h-full">
                <GlowCard className="h-full p-5 sm:p-8">
                  <div className="mb-4 sm:mb-6 inline-flex rounded-xl border border-border bg-secondary p-2.5 sm:p-3">
                    <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <div className="mt-4 sm:mt-6 inline-flex items-center text-xs sm:text-sm font-medium text-foreground opacity-90 sm:opacity-0 transition-opacity group-hover:opacity-100">
                    Explorar <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-secondary p-6 sm:p-16 text-center"
        >
          <div className="relative">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-muted-foreground">
              Junta-te à comunidade e recebe novidades, conteúdo exclusivo e acesso ao Lab.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" className="shadow-glow w-full sm:w-auto min-h-[44px]">
                <Link to="/register">
                  Criar conta <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background w-full sm:w-auto min-h-[44px]">
                <Link to="/comunidade">Comunidade</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
