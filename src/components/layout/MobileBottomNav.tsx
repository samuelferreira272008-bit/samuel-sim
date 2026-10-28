import { Link, useLocation } from "react-router-dom";
import { Home, AppWindow, Code2, Sparkles, Menu } from "lucide-react";

interface NavItem {
  to?: string;
  label: string;
  icon: typeof Home;
  isAction?: boolean;
  action?: () => void;
  matches?: (path: string) => boolean;
}

export function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const openMobileMenu = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-menu"));
  };

  const navItems: NavItem[] = [
    {
      to: "/",
      label: "Início",
      icon: Home,
      matches: (p) => p === "/",
    },
    {
      to: "/apps",
      label: "Apps",
      icon: AppWindow,
      matches: (p) => p.startsWith("/apps"),
    },
    {
      to: "/projetos",
      label: "Projetos",
      icon: Code2,
      matches: (p) => p.startsWith("/projetos"),
    },
    {
      to: "/patrocinar",
      label: "Apoiar",
      icon: Sparkles,
      matches: (p) => ["/patrocinar", "/pricing", "/planos", "/precos"].includes(p),
    },
    {
      label: "Mais",
      icon: Menu,
      isAction: true,
      action: openMobileMenu,
    },
  ];

  return (
    <nav
      aria-label="Navegação móvel inferior"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl transition-all"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matches ? item.matches(currentPath) : false;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                aria-label="Abrir menu completo"
                className="flex flex-col items-center justify-center gap-1 py-1 text-muted-foreground transition-all active:scale-95 hover:text-foreground focus-visible:outline-none"
              >
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.to!}
              className={`flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 focus-visible:outline-none ${
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  isActive ? "bg-foreground/10 text-foreground" : ""
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-foreground" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
