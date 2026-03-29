import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin pages — loaded only when the user navigates to /admin/*
const LoginPage = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ClientList = lazy(() => import("./pages/admin/ClientList"));
const ClientCreate = lazy(() => import("./pages/admin/ClientCreate"));
const ClientDetail = lazy(() => import("./pages/admin/ClientDetail"));
const ClientEdit = lazy(() => import("./pages/admin/ClientEdit"));
const SessionList = lazy(() => import("./pages/admin/SessionList"));
const SessionCreate = lazy(() => import("./pages/admin/SessionCreate"));
const SessionDetail = lazy(() => import("./pages/admin/SessionDetail"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const ClientImport = lazy(() => import("./pages/admin/ClientImport"));
const ClientOCRImport = lazy(() => import("./pages/admin/ClientOCRImport"));
const AdminLayout = lazy(() =>
  import("./components/admin/layout/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  }))
);

// Public token-based form pages — separate chunks from the landing page
const AnamnesisPage = lazy(() => import("./pages/public/AnamnesisPage"));
const IntakePage = lazy(() => import("./pages/public/IntakePage"));
const SatisfactionPage = lazy(() => import("./pages/public/SatisfactionPage"));
const PreparePage = lazy(() => import("./pages/public/PreparePage"));
const PrivacyPolicy = lazy(() => import("./pages/public/PrivacyPolicy"));
const HomeHarmonyPage = lazy(() => import("./pages/public/HomeHarmonyPage"));

const loadingSpinner = (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={loadingSpinner}>
            <Routes>
              {/* Public - Landing Page */}
              <Route path="/" element={<Index />} />

              {/* Public - Anamnesis form (token-based, no auth) */}
              <Route path="/anamnese/:token" element={<AnamnesisPage />} />

              {/* Public - Pre-session intake form (token-based, no auth) */}
              <Route path="/pre-sessao/:token" element={<IntakePage />} />
              <Route path="/pre-imersao/:token" element={<IntakePage />} />

              {/* Public - Satisfaction survey (token-based, no auth) */}
              <Route path="/satisfacao/:token" element={<SatisfactionPage />} />

              {/* Public - Unified preparation form (token-based, no auth) */}
              <Route path="/preparar/:token" element={<PreparePage />} />

              {/* Public - Privacy Policy */}
              <Route path="/politica-privacidade" element={<PrivacyPolicy />} />

              {/* Public - Home Harmony */}
              <Route path="/home-harmony" element={<HomeHarmonyPage />} />

              {/* Admin - Login */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Admin - Protected Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clientes" element={<ClientList />} />
                <Route path="clientes/novo" element={<ClientCreate />} />
                <Route path="clientes/importar" element={<ClientImport />} />
                <Route path="clientes/ocr" element={<ClientOCRImport />} />
                <Route path="clientes/:id" element={<ClientDetail />} />
                <Route path="clientes/:id/editar" element={<ClientEdit />} />
                <Route path="sessoes" element={<SessionList />} />
                <Route path="sessoes/nova" element={<SessionCreate />} />
                <Route path="sessoes/:id" element={<SessionDetail />} />
                <Route path="satisfacao" element={<Dashboard />} />
                <Route path="configuracoes" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
