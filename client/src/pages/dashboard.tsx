import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
          <h1 className="text-lg font-semibold" data-testid="text-header-title">
            Katalyst Growth Planner
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {user.profileImageUrl && (
                  <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.email} />
                )}
                <AvatarFallback data-testid="text-avatar-fallback">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-sm">
                <p className="font-medium leading-none" data-testid="text-user-name">
                  {user.displayName || user.email}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5" data-testid="text-user-role">
                  {user.role.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold" data-testid="text-welcome">
              Welcome, {user.displayName || user.email}
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground" data-testid="text-dashboard-info">
              You are signed in as a {user.role.replace(/_/g, " ")}. The planning tools will be available here as development continues.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
