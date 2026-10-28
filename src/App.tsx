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
import Sobre from "@/pages/Sobre";
import Ferramentas from "@/pages/Ferramentas";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/blog/BlogPost";
import Comunidade from "@/pages/Comunidade";
import Comprar from "@/pages/Comprar";
import Contacto from "@/pages/Contacto";
import SearchPage from "@/pages/Search";
import Lab from "@/pages/Lab";
import Patrocinar from "@/pages/Patrocinar";
import Assistente from "@/pages/Assistente";
import Empresas from "@/pages/Empresas";
import EmpresaDetail from "@/pages/EmpresaDetail";
import Produtos from "@/pages/Produtos";
import ProdutoDetail from "@/pages/ProdutoDetail";
import Repositorio from "@/pages/Repositorio";
import RepoItemDetail from "@/pages/RepoItemDetail";
import Legal from "@/pages/Legal";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/dashboard/Dashboard";
import Perfil from "@/pages/dashboard/Perfil";
import Conteudo from "@/pages/dashboard/Conteudo";
import Compras from "@/pages/dashboard/Compras";
import Certificados from "@/pages/dashboard/Certificados";
import Configuracoes from "@/pages/dashboard/Configuracoes";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminConteudo from "@/pages/admin/AdminConteudo";
import AdminMembros from "@/pages/admin/AdminMembros";
import AdminCertificados from "@/pages/admin/AdminCertificados";
import AdminProjetos from "@/pages/admin/AdminProjetos";
import AdminEmpresas from "@/pages/admin/AdminEmpresas";
import AdminOfertas from "@/pages/admin/AdminOfertas";
import AdminNewsletter from "@/pages/admin/AdminNewsletter";
import AdminContactos from "@/pages/admin/AdminContactos";
import AdminLogs from "@/pages/admin/AdminLogs";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminManualPayments from "@/pages/admin/AdminManualPayments";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminAI from "@/pages/admin/AdminAI";
import AdminBackups from "@/pages/admin/AdminBackups";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/apps" element={<Repositorio type="app" />} />
              <Route path="/apps/:id" element={<RepoItemDetail />} />
              <Route path="/projetos" element={<Repositorio type="project" />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
