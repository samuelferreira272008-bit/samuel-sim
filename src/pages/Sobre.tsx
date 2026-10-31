import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ExternalLink,
  Globe,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/lib/seo";
import { PhotoFrame } from "@/components/visuals/PhotoFrame";
import { MediaBlock } from "@/components/media/MediaBlock";
import { db, whatsappHref } from "@/lib/repo";
import portrait from "@/assets/hero-portrait.jpg";

const timeline = [
  { year: "2026 / Presente", title: "Unificação da Marca Samuel Simão", desc: "Decisão estratégica de unir todos os projetos sob a minha identidade. Projeto REPI Rover no IMPTEL (Curiosity Challenge) e ecossistema digital." },
  { year: "2024 / 2025", title: "Eletrónica, Robótica & IA", desc: "Avanço nos estudos de Telecomunicações no IMPTEL (Camama) e desenvolvimento de assistentes práticos como o Pafiworky." },
  { year: "2023", title: "Primeiros Protótipos", desc: "Criação de ferramentas web, exploração de servidores locais e prototipagem de aplicações." },
  { year: "Origem", title: "Luanda, Angola", desc: "Nascido a 27 de julho de 2008, guiado pela fé cristã, família e paixão por construir." },
];

const principles = [
  { title: "Tudo é Samuel Simão", desc: "Uma marca pessoal transparente e direta. Falo na primeira pessoa, construo com a minha assinatura e assumo a responsabilidade." },
  { title: "Simplicidade para o utilizador", desc: "Complexidade para a máquina, simplicidade para quem usa. A tecnologia deve resolver problemas sem burocracia." },
  { title: "Fé, Família & Honestidade", desc: "Sou cristão. Deus está no centro das minhas decisões e a honestidade é um princípio inegociável." },
  { title: "Fazer os outros felizes", desc: "Acredito que ser feliz é também ajudar os outros a prosperar através do conhecimento prático." },
];

const socialLabels: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "X / Twitter",
  tiktok: "TikTok",
  facebook: "Facebook",
  website: "Website",
};

export default function Sobre() {
  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses-public"],
    queryFn: async () => {
      const { data } = await db
        .from("businesses")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const fullName = profile?.full_name || "Samuel Simão";
  const headline = profile?.headline || "Estudante de Eletrónica e Telecomunicações no IMPTEL · Empreendedor Digital";
  const location = profile?.location || "Luanda, Angola";
  const photos: string[] = Array.isArray(profile?.photos) && profile.photos.length > 0 ? profile.photos : [portrait];
  const mainPhoto = photos[0] || portrait;
  const extraPhotos = photos.slice(1);
  const waLink = whatsappHref(profile?.whatsapp, `Olá ${fullName}!`);
  const socialEntries = Object.entries(profile?.social_links ?? {}).filter(
    ([, url]) => typeof url === "string" && url.trim().length > 0,
  ) as [string, string][];

  useSEO({
    title: `Sobre — ${fullName}`,
    description: headline,
  });

  return (
    <div className="relative overflow-hidden bg-mesh">
      <div className="mx-auto grid max-w-6xl gap-8 sm:gap-12 px-4 py-10 sm:py-20 lg:py-24 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6 lg:sticky lg:top-24 lg:self-start"
        >
          <PhotoFrame src={mainPhoto} alt={fullName} />
          {extraPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {extraPhotos.map((src, idx) => (
                <MediaBlock key={idx} imageUrl={src} aspect="aspect-square" />
              ))}
            </div>
          ) : (
            <MediaBlock imageUrl={mainPhoto} aspect="aspect-square" className="hidden lg:block" />
          )}

          {/* Contact details & Social Links card */}
          {(profile?.contact_email ||
            profile?.contact_phone ||
            waLink ||
            profile?.location ||
            socialEntries.length > 0) && (
            <Card className="border-border/60 bg-card/80 backdrop-blur">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground">
                  Contacto & Redes
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-foreground shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                  {profile?.contact_email && (
                    <a
                      href={`mailto:${profile.contact_email}`}
                      className="flex items-center gap-2 hover:text-foreground transition-colors truncate"
                    >
                      <Mail className="h-4 w-4 text-foreground shrink-0" />
                      <span className="truncate">{profile.contact_email}</span>
                    </a>
                  )}
                  {profile?.contact_phone && (
                    <a
                      href={`tel:${profile.contact_phone}`}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Phone className="h-4 w-4 text-foreground shrink-0" />
                      <span>{profile.contact_phone}</span>
                    </a>
                  )}
                </div>

                {waLink && (
                  <Button asChild size="sm" className="w-full min-h-[44px]">
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
                    </a>
                  </Button>
                )}

                {socialEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                    {socialEntries.map(([key, url]) => (
                      <Button key={key} asChild variant="outline" size="sm" className="text-xs">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Globe className="mr-1.5 h-3.5 w-3.5" />
                          {socialLabels[key] ?? key}
                          <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Sobre</p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl break-words"
          >
            {fullName}
          </motion.h1>
          {headline && <p className="mt-2 text-base sm:text-xl font-medium text-muted-foreground">{headline}</p>}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground"
          >
            {profile?.bio ? (
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{profile.bio}</ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <p>
                  Olá! Sou o <span className="font-semibold text-foreground">{fullName}</span> (Samuel Garcia Ferreira Simão), nascido a 27 de julho de 2008 em Luanda, Angola.
                </p>
                <p>
                  Sou estudante do curso de <span className="text-foreground font-semibold">Eletrónica e Telecomunicações no IMPTEL</span> (Instituto Médio Politécnico de Telecomunicações, em Camama), a frequentar a 13.ª classe com conclusão prevista para 2027.
                </p>
                <p>
                  A minha paixão é construir: desde sistemas físicos e robôs (como o projeto <span className="text-foreground font-medium">REPI Rover</span> para o Curiosity Challenge) até assistentes inteligentes como o <span className="text-foreground font-medium">Pafiworky</span> e ferramentas digitais que simplificam o dia a dia.
                </p>
                <p>
                  Em outubro de 2026, tomei uma decisão essencial: <span className="text-foreground font-semibold">unificar tudo sob a minha própria identidade pessoal</span>. Deixei para trás marcas dispersas (D9, Seven, theNuvem, Demonicast, Caracol, MiniStral) para assumir o meu nome: <em className="text-foreground">"Tudo será Samuel Simão, sobre Samuel Simão, para Samuel Simão."</em>
                </p>
                <p>
                  Sou cristão e coloco Deus, a família, o estudo e a honestidade na base de qualquer projeto. O meu objetivo é construir um negócio sustentável, alcançar independência financeira e ajudar quem está a começar, transmitindo conhecimento prático e sem complicações.
                </p>
              </div>
            )}
          </motion.div>

          {/* Companies & their Websites */}
          {businesses.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> Empresas & Marcas
                </h2>
                <Link to="/empresas" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {businesses.map((b: any) => (
                  <Card key={b.id} className="border-border/60 bg-background/80">
                    <CardContent className="flex flex-col justify-between gap-4 p-5 h-full">
                      <div>
                        <div className="flex items-center gap-3">
                          {b.logo_url && (
                            <img
                              src={b.logo_url}
                              alt={b.name}
                              className="h-10 w-10 rounded-lg border border-border/60 bg-checker object-contain p-1"
                            />
                          )}
                          <div>
                            <Link to={`/empresas/${b.slug}`} className="font-semibold text-foreground hover:underline">
                              {b.name}
                            </Link>
                            {b.tagline && <p className="text-xs text-muted-foreground line-clamp-1">{b.tagline}</p>}
                          </div>
                        </div>
                        {b.description && (
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{b.description}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button asChild size="sm" variant="secondary">
                          <Link to={`/empresas/${b.slug}`}>
                            Detalhes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        {b.website && (
                          <Button asChild size="sm" variant="outline">
                            <a href={b.website} target="_blank" rel="noopener noreferrer">
                              Website <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-border/60 bg-background p-5"
              >
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-bold text-foreground">Percurso</h2>
          <div className="mt-6 space-y-6">
            {timeline.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative border-l-2 border-foreground/20 pl-8"
              >
                <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-foreground" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.year}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{t.title}</h3>
                <p className="mt-1 text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
