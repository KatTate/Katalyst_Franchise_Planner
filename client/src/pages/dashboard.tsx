import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

interface PlanSummary {
  id: string;
  name: string;
  brandId: string;
  quickStartCompleted: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const showPlans = user?.role === "franchisee" || user?.role === "franchisor";

  const { data: plans, isLoading: plansLoading } = useQuery<PlanSummary[]>({
    queryKey: ["/api/plans"],
    enabled: showPlans,
  });

  if (!user) return null;

  const isAdmin = user.role === "katalyst_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-welcome">
          Welcome, {user.displayName || user.email}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Katalyst Growth Planner Dashboard
        </p>
      </div>

      {showPlans && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium" data-testid="text-plans-heading">Your Plans</h2>
          {plansLoading ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-muted-foreground text-sm">Loading plans...</p>
              </CardContent>
            </Card>
          ) : plans && plans.length > 0 ? (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <Link key={plan.id} href={`/plans/${plan.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-plan-${plan.id}`}>
                    <CardContent className="flex items-center gap-3 py-4">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" data-testid={`text-plan-name-${plan.id}`}>
                          {plan.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.quickStartCompleted ? "In progress" : "Quick start needed"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6">
                <p className="text-muted-foreground text-sm" data-testid="text-no-plans">
                  No plans yet. Your plan will appear here once it's created.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-medium" data-testid="text-dashboard-heading">
              Getting Started
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm" data-testid="text-dashboard-info">
              Manage your brands, invite users, and use Demo Mode to preview the franchisee experience.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/brands">
                <Button variant="outline" size="sm" data-testid="button-go-brands">
                  Manage Brands
                </Button>
              </Link>
              <Link href="/admin/invitations">
                <Button variant="outline" size="sm" data-testid="button-go-invitations">
                  Invitations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
