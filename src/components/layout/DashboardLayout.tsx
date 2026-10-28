import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  ShoppingBag,
  Award,
  Settings,
  FolderOpen,
  Bot,
  Home,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const sidebarItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Perfil", url: "/perfil", icon: User },
  { title: "Conteúdo", url: "/conteudo", icon: FileText },
  { title: "Compras", url: "/compras", icon: ShoppingBag },
  { title: "Certificados", url: "/certificados", icon: Award },
  { title: "Ficheiros", url: "/ficheiros", icon: FolderOpen },
  { title: "Assistente", url: "/assistente", icon: Bot },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
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

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <span className="text-sm font-semibold text-foreground">Painel</span>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Site público
              </Link>
            </Button>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
