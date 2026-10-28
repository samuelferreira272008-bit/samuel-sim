import { Link } from "react-router-dom";

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

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Info */}
          <div>
            <h3 className="text-lg font-bold text-foreground">Samuel Simão</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Criador Digital, Developer e Educador. A construir ferramentas e conteúdo para a comunidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Links</h4>
            <ul className="mt-2 space-y-2">
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
          © {new Date().getFullYear()} Samuel Simão. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
