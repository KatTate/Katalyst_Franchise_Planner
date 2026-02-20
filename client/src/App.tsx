import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { WorkspaceViewProvider } from "@/contexts/WorkspaceViewContext";
import { AppSidebar } from "@/components/app-sidebar";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import AdminBrandsPage from "@/pages/admin-brands";
import AdminBrandDetailPage from "@/pages/admin-brand-detail";
import InvitationsPage from "@/pages/invitations";
import OnboardingPage from "@/pages/onboarding";
import AcceptInvitationPage from "@/pages/accept-invitation";
import PlanningWorkspacePage from "@/pages/planning-workspace";
import GlossaryPage from "@/pages/glossary";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ImpersonationProvider>
        <DemoModeProvider>
          <WorkspaceViewProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-12 items-center border-b px-4">
                <SidebarTrigger />
              </header>
              <ImpersonationBanner />
              <DemoModeBanner />
              <main className="flex-1 p-6">
                {children}
              </main>
            </SidebarInset>
          </WorkspaceViewProvider>
        </DemoModeProvider>
      </ImpersonationProvider>
    </SidebarProvider>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground" data-testid="text-loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/invite/:token" component={AcceptInvitationPage} />
      <Route path="/">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/admin/brands">
        {() => <ProtectedRoute component={AdminBrandsPage} />}
      </Route>
      <Route path="/admin/brands/:brandId">
        {() => <ProtectedRoute component={AdminBrandDetailPage} />}
      </Route>
      <Route path="/invitations">
        {() => <ProtectedRoute component={InvitationsPage} />}
      </Route>
      <Route path="/onboarding">
        {() => <ProtectedRoute component={OnboardingPage} />}
      </Route>
      <Route path="/plans/:planId">
        {() => <ProtectedRoute component={PlanningWorkspacePage} />}
      </Route>
      <Route path="/glossary">
        {() => <ProtectedRoute component={GlossaryPage} />}
      </Route>
      <Route component={NotFound} />
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
