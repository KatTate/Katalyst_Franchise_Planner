import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Mail, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  const isAdmin = user.role === "katalyst_admin" || user.role === "franchisor";

  const navItems = [
    { title: "Dashboard", url: "/", icon: Home, visible: true },
    { title: "Invitations", url: "/admin/invitations", icon: Mail, visible: isAdmin },
  ].filter((item) => item.visible);

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Katalyst Growth Planner</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={location === item.url}
                    onClick={() => setLocation(item.url)}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            {user.profileImageUrl && (
              <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.email} />
            )}
            <AvatarFallback data-testid="text-sidebar-avatar">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-sidebar-user-name">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-sidebar-user-role">
              {user.role.replace(/_/g, " ")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Sign out"
            data-testid="button-sidebar-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
