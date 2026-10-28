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
  { year: "Hoje", title: "A construir o ecossistema", desc: "Plataforma única com blog, lab, ferramentas, apps e comunidade." },
  { year: "2024", title: "Educador digital", desc: "Conteúdo e tutoriais em português para quem quer crescer." },
  { year: "2023", title: "Developer & criador", desc: "Projetos open source, produtos digitais e experiências web." },
  { year: "Sempre", title: "Curiosidade infinita", desc: "Aprender, construir, partilhar — em loop." },
];

const principles = [
  { title: "Construir em público", desc: "Mostro o processo, não só o resultado." },
  { title: "Conteúdo livre", desc: "A maioria do que partilho é gratuito." },
  { title: "Excelência simples", desc: "Menos é mais — clareza acima de tudo." },
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
  const headline = profile?.headline || "Criador digital, developer e educador";
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
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6 lg:sticky lg:top-24 lg:self-start"
        >
          <PhotoFrame src={mainPhoto} alt={fullName} />
          {extraPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
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
              <CardContent className="space-y-4 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Contacto & Redes
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.contact_email && (
                    <a
                      href={`mailto:${profile.contact_email}`}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4 text-foreground" />
                      <span>{profile.contact_email}</span>
                    </a>
                  )}
                  {profile?.contact_phone && (
                    <a
                      href={`tel:${profile.contact_phone}`}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Phone className="h-4 w-4 text-foreground" />
                      <span>{profile.contact_phone}</span>
                    </a>
                  )}
                </div>

                {waLink && (
                  <Button asChild size="sm" className="w-full">
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> Falar no WhatsApp
                    </a>
                  </Button>
                )}

                {socialEntries.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {socialEntries.map(([key, url]) => (
                      <Button key={key} asChild variant="outline" size="sm">
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
            className="mt-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
          >
            {fullName}
          </motion.h1>
          {headline && <p className="mt-2 text-xl font-medium text-muted-foreground">{headline}</p>}

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
              <>
                <p>
                  Sou <span className="font-semibold text-foreground">{fullName}</span> — criador digital, developer e educador.
                  Construo plataformas, escrevo conteúdo e partilho ferramentas para ajudar outras pessoas a aprender tecnologia.
                </p>
                <p>
                  Esta é a minha plataforma pessoal: um ponto único onde encontras o blog, projetos, aplicações, ferramentas que recomendo,
                  experiências em desenvolvimento (Lab), uma comunidade e a vitrine de produtos.
                </p>
              </>
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
