import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Globe, Mail, MapPin, MessageCircle } from "lucide-react";
import { db, whatsappHref } from "@/lib/repo";

const footerLinks = [
  { to: "/sobre", label: "Sobre" },
  { to: "/apps", label: "Apps & Programas" },
  { to: "/projetos", label: "Projetos" },
  { to: "/conteudos", label: "Conteúdos" },
  { to: "/produtos", label: "Produtos" },
  { to: "/empresas", label: "Empresas" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/lab", label: "Lab" },
  { to: "/patrocinar", label: "Planos & Patrocínio" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" },
];

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

export function Footer() {
  const { data: profile } = useQuery({
    queryKey: ["site-profile"],
    queryFn: async () => (await db.from("site_profile").select("*").limit(1).maybeSingle()).data,
  });

  const fullName: string = profile?.full_name?.trim() || "Samuel Simão";
  const headline: string =
    profile?.headline?.trim() || "Criador Digital, Developer e Educador";
  const location: string = profile?.location?.trim() || "Luanda, Angola";
  const waLink = whatsappHref(profile?.whatsapp, `Olá ${fullName}!`);
  const socialEntries = Object.entries(profile?.social_links ?? {}).filter(
    ([, url]) => typeof url === "string" && url.trim().length > 0,
  ) as [string, string][];

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">{fullName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {headline}. Construo ferramentas digitais, projetos práticos e conteúdos educativos pensados para simplificar a tecnologia.
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-foreground" />
              {location}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Plataforma</h4>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Channels & Social */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Contacto & Redes</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {profile?.contact_email && (
                <li>
                  <a
                    href={`mailto:${profile.contact_email}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground break-all"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {profile.contact_email}
                  </a>
                </li>
              )}
              {waLink && (
                <li>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    WhatsApp direto
                  </a>
                </li>
              )}
              {socialEntries.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    {socialLabels[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link to="/termos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {fullName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
