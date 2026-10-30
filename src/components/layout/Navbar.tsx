import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, LayoutDashboard, Shield, ChevronDown } from "lucide-react";
import { Magnetic } from "@/components/visuals/Magnetic";

const primaryNavLinks = [
  { to: "/", label: "Home" },
  { to: "/sobre", label: "Sobre" },
  { to: "/apps", label: "Apps" },
  { to: "/projetos", label: "Projetos" },
  { to: "/produtos", label: "Produtos" },
  { to: "/empresas", label: "Empresas" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" },
];

const moreNavLinks = [
  { to: "/conteudos", label: "Conteúdos" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/lab", label: "Lab" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/patrocinar", label: "Planos & Apoio" },
];

const allNavLinks = [
  { to: "/", label: "Home" },
  { to: "/sobre", label: "Sobre" },
  { to: "/apps", label: "Apps" },
  { to: "/projetos", label: "Projetos" },
  { to: "/conteudos", label: "Conteúdos" },
  { to: "/produtos", label: "Produtos" },
  { to: "/empresas", label: "Empresas" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/lab", label: "Lab" },
  { to: "/blog", label: "Blog" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/patrocinar", label: "Planos & Apoio" },
  { to: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener("open-mobile-menu", handler);
    return () => window.removeEventListener("open-mobile-menu", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const avatarInitial =
    profile?.display_name?.charAt(0).toUpperCase() ??
    user?.email?.charAt(0).toUpperCase() ??
    "U";

  const isMoreActive = moreNavLinks.some(
    (link) => location.pathname === link.to || location.pathname.startsWith(`${link.to}/`),
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/75 backdrop-blur-2xl shadow-xs transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Magnetic strength={0.15} radius={60}>
          <Link to="/" className="shrink-0 whitespace-nowrap text-xl font-bold tracking-tight inline-block active:scale-[0.98]">
            <span className="text-gradient">Samuel</span> <span className="text-foreground">Simão</span>
          </Link>
        </Magnetic>

        <nav className="hidden items-center gap-0.5 lg:flex min-w-0">
          {primaryNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground xl:px-3 xl:py-2"
              activeClassName="text-foreground bg-accent"
            >
              {link.label}
            </NavLink>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground xl:px-3 xl:py-2 ${
                  isMoreActive ? "bg-accent text-foreground" : "text-muted-foreground"
                }`}
              >
                Explorar
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {moreNavLinks.map((link) => (
                <DropdownMenuItem key={link.to} onClick={() => navigate(link.to)} className="cursor-pointer">
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <GlobalSearch />
          {user && <NotificationBell />}

          <div className="hidden lg:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {avatarInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="truncate text-sm font-medium">{profile?.display_name ?? user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role ?? "user"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Magnetic strength={0.2} radius={70}>
                <Button variant="default" size="sm" onClick={() => navigate("/login")} className="rounded-xl px-4 font-semibold shadow-xs">
                  Login
                </Button>
              </Magnetic>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px]">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[85vw] p-6 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left font-bold text-lg">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1.5">
                {allNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className="flex min-h-[44px] items-center rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent active:bg-accent/80"
                    activeClassName="text-foreground bg-accent font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="my-4 h-px bg-border" />
                {user ? (
                  <>
                    <div className="rounded-xl bg-secondary/50 p-3 mb-2">
                      <p className="truncate text-sm font-medium text-foreground">{profile?.display_name ?? user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role ?? "user"}</p>
                    </div>
                    <Button variant="ghost" className="min-h-[44px] justify-start rounded-xl" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    {role === "admin" && (
                      <Button variant="ghost" className="min-h-[44px] justify-start rounded-xl" onClick={() => { navigate("/admin"); setMobileOpen(false); }}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    )}
                    <Button variant="ghost" className="min-h-[44px] justify-start rounded-xl text-destructive hover:bg-destructive/10" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Terminar Sessão
                    </Button>
                  </>
                ) : (
                  <Button variant="default" className="min-h-[44px] rounded-xl font-semibold w-full mt-2" onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                    Entrar na Conta
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
