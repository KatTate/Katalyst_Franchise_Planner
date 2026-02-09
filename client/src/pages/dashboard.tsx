import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

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
      <Card>
        <CardHeader>
          <h2 className="text-base font-medium" data-testid="text-dashboard-heading">
            Getting Started
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm" data-testid="text-dashboard-info">
            You are signed in as a {user.role.replace(/_/g, " ")}. The planning tools will be available here as development continues.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
