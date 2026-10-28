import { Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Tag,
  Mail,
  MessageSquare,
  Activity,
  BarChart3,
  Bell,
  Bot,
  Archive,
  CreditCard,
  Award,
  Boxes,
  Building2,
  Settings,
  Home,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Assistente AI", url: "/admin/assistente", icon: Bot },
  { title: "Backups", url: "/admin/backups", icon: Archive },
  { title: "Pagamentos", url: "/admin/manual-payments", icon: CreditCard },
  { title: "Notificações", url: "/admin/notificacoes", icon: Bell },
  { title: "Conteúdo (Blog)", url: "/admin/conteudo", icon: FileText },
  { title: "Repositórios", url: "/admin/projetos", icon: Boxes },
  { title: "Produtos & Loja", url: "/admin/ofertas", icon: Tag },
  { title: "Empresas", url: "/admin/empresas", icon: Building2 },
  { title: "Membros", url: "/admin/membros", icon: Users },
  { title: "Certificados", url: "/admin/certificados", icon: Award },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Contactos", url: "/admin/contactos", icon: MessageSquare },
  { title: "System Logs", url: "/admin/logs", icon: Activity },
  { title: "Sobre, Legal & Settings", url: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-3">
          {!collapsed && (
            <>
              <span className="text-sm font-bold text-sidebar-foreground">Admin</span>
              <Badge variant="secondary" className="text-xs">Sistema</Badge>
            </>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <span className="text-sm font-semibold text-foreground">Administração</span>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Site público
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Painel
              </Link>
            </Button>
            <Badge variant="destructive" className="text-xs">Admin</Badge>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
