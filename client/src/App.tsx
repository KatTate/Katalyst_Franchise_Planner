import { useRef, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import InvitationsPage from "@/pages/invitations";
import AcceptInvitationPage from "@/pages/accept-invitation";
import OnboardingPage from "@/pages/onboarding";
import AdminBrandsPage from "@/pages/admin-brands";
import AdminBrandDetailPage from "@/pages/admin-brand-detail";
import NotFound from "@/pages/not-found";
import StartupCostsDevPage from "@/pages/startup-costs-dev";
import MetricsDevPage from "@/pages/metrics-dev";
import InputsDevPage from "@/pages/inputs-dev";
import { useBrandTheme } from "@/hooks/use-brand-theme";
import { ImpersonationProvider, useImpersonation } from "@/contexts/ImpersonationContext";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element | null }) {
  const { isAuthenticated, isLoading } = useAuth();
  const wasAuthenticated = useRef(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && wasAuthenticated.current) {
      wasAuthenticated.current = false;
      setLocation("/login?expired=true");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: () => JSX.Element | null }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role === "franchisee") {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function FranchiseeOnboardingGuard({ component: Component }: { component: () => JSX.Element | null }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user?.role === "franchisee" && !user.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <FranchiseeOnboardingGuard component={DashboardPage} />
      </Route>
      <Route path="/admin/invitations">
        <AdminRoute component={InvitationsPage} />
      </Route>
      <Route path="/admin/brands">
        <AdminRoute component={AdminBrandsPage} />
      </Route>
      <Route path="/admin/brands/:brandId">
        <AdminRoute component={AdminBrandDetailPage} />
      </Route>
      <Route path="/plans/:planId/startup-costs">
        <ProtectedRoute component={StartupCostsDevPage} />
      </Route>
      <Route path="/plans/:planId/metrics">
        <ProtectedRoute component={MetricsDevPage} />
      </Route>
      <Route path="/plans/:planId/inputs">
        <ProtectedRoute component={InputsDevPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayoutInner() {
  useBrandTheme();
  const { active: isImpersonating, readOnly } = useImpersonation();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          {isImpersonating ? (
            <ImpersonationBanner />
          ) : (
            <header className="flex items-center gap-2 p-2 border-b h-12">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
          )}
          <main className={`flex-1 overflow-auto p-4 sm:p-6${isImpersonating && readOnly ? " opacity-60" : ""}`}>
            <AppRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedLayout() {
  return (
    <ImpersonationProvider>
      <AuthenticatedLayoutInner />
    </ImpersonationProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/invite/:token" component={AcceptInvitationPage} />
      <Route path="/onboarding">
        <ProtectedRoute component={OnboardingPage} />
      </Route>
      <Route>
        <ProtectedRoute component={AuthenticatedLayout} />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
