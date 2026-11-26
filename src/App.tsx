import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

import Home from "@/pages/Home";

const Sobre = lazy(() => import("@/pages/Sobre"));
const Ferramentas = lazy(() => import("@/pages/Ferramentas"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/blog/BlogPost"));
const Comunidade = lazy(() => import("@/pages/Comunidade"));
const Comprar = lazy(() => import("@/pages/Comprar"));
const Contacto = lazy(() => import("@/pages/Contacto"));
const SearchPage = lazy(() => import("@/pages/Search"));
const Lab = lazy(() => import("@/pages/Lab"));
const Patrocinar = lazy(() => import("@/pages/Patrocinar"));
const Assistente = lazy(() => import("@/pages/Assistente"));
const Empresas = lazy(() => import("@/pages/Empresas"));
const EmpresaDetail = lazy(() => import("@/pages/EmpresaDetail"));
const Produtos = lazy(() => import("@/pages/Produtos"));
const ProdutoDetail = lazy(() => import("@/pages/ProdutoDetail"));
const Repositorio = lazy(() => import("@/pages/Repositorio"));
const RepoItemDetail = lazy(() => import("@/pages/RepoItemDetail"));
const Projetos = lazy(() => import("@/pages/Projetos"));
const Legal = lazy(() => import("@/pages/Legal"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));

const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Perfil = lazy(() => import("@/pages/dashboard/Perfil"));
const Conteudo = lazy(() => import("@/pages/dashboard/Conteudo"));
const Compras = lazy(() => import("@/pages/dashboard/Compras"));
const Certificados = lazy(() => import("@/pages/dashboard/Certificados"));
const Configuracoes = lazy(() => import("@/pages/dashboard/Configuracoes"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminConteudo = lazy(() => import("@/pages/admin/AdminConteudo"));
const AdminMembros = lazy(() => import("@/pages/admin/AdminMembros"));
const AdminCertificados = lazy(() => import("@/pages/admin/AdminCertificados"));
const AdminProjetos = lazy(() => import("@/pages/admin/AdminProjetos"));
const AdminEmpresas = lazy(() => import("@/pages/admin/AdminEmpresas"));
const AdminOfertas = lazy(() => import("@/pages/admin/AdminOfertas"));
const AdminNewsletter = lazy(() => import("@/pages/admin/AdminNewsletter"));
const AdminContactos = lazy(() => import("@/pages/admin/AdminContactos"));
const AdminLogs = lazy(() => import("@/pages/admin/AdminLogs"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminNotifications = lazy(() => import("@/pages/admin/AdminNotifications"));
const AdminManualPayments = lazy(() => import("@/pages/admin/AdminManualPayments"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminAI = lazy(() => import("@/pages/admin/AdminAI"));
const AdminBackups = lazy(() => import("@/pages/admin/AdminBackups"));

const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/apps" element={<Repositorio type="app" />} />
                <Route path="/apps/:id" element={<RepoItemDetail />} />
                <Route path="/projetos" element={<Projetos />} />
                <Route path="/projetos/:id" element={<RepoItemDetail />} />
                <Route path="/conteudos" element={<Repositorio type="content" />} />
                <Route path="/conteudos/:id" element={<RepoItemDetail />} />
                <Route path="/produtos" element={<Produtos />} />
                <Route path="/produtos/:id" element={<ProdutoDetail />} />
                <Route path="/ferramentas" element={<Ferramentas />} />
                <Route path="/ferramentas/:id" element={<RepoItemDetail />} />
                <Route path="/lab" element={<Lab />} />
                <Route path="/lab/:id" element={<RepoItemDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/comunidade" element={<Comunidade />} />
                <Route path="/comprar" element={<Comprar />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/patrocinar" element={<Patrocinar />} />
                <Route path="/pricing" element={<Patrocinar />} />
                <Route path="/precos" element={<Patrocinar />} />
                <Route path="/planos" element={<Patrocinar />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/empresas/:slug" element={<EmpresaDetail />} />
                <Route path="/termos" element={<Legal kind="terms" />} />
                <Route path="/privacidade" element={<Legal kind="privacy" />} />
              </Route>

              {/* Auth routes (no layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Dashboard routes (protected) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/conteudo" element={<Conteudo />} />
                  <Route path="/compras" element={<Compras />} />
                  <Route path="/certificados" element={<Certificados />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/assistente" element={<Assistente />} />
                </Route>
              </Route>

              {/* Admin routes (admin-only) */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/conteudo" element={<AdminConteudo />} />
                  <Route path="/admin/projetos" element={<AdminProjetos />} />
                  <Route path="/admin/empresas" element={<AdminEmpresas />} />
                  <Route path="/admin/membros" element={<AdminMembros />} />
                  <Route path="/admin/certificados" element={<AdminCertificados />} />
                  <Route path="/admin/ofertas" element={<AdminOfertas />} />
                  <Route path="/admin/manual-payments" element={<AdminManualPayments />} />
                  <Route path="/admin/newsletter" element={<AdminNewsletter />} />
                  <Route path="/admin/contactos" element={<AdminContactos />} />
                  <Route path="/admin/logs" element={<AdminLogs />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/notificacoes" element={<AdminNotifications />} />
                  <Route path="/admin/assistente" element={<AdminAI />} />
                  <Route path="/admin/backups" element={<AdminBackups />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/perfil" element={<AdminSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
