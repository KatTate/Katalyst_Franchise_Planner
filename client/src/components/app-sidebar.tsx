import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useBrandTheme } from "@/hooks/use-brand-theme";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Home, Mail, Building2, LogOut, CalendarCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { brand } = useBrandTheme();
  const { active: isImpersonating } = useImpersonation();
  const { active: isDemoMode } = useDemoMode();
  const [location, setLocation] = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoError, setLogoError] = useState(false);

  if (!user) return null;

  const realRole = user._realUser?.role ?? user.role;
  const isRealAdmin = realRole === "katalyst_admin" || realRole === "franchisor";
  const isRealKatalystAdmin = realRole === "katalyst_admin";
  const isEffectiveKatalystAdmin = user.role === "katalyst_admin";
  const hasBrandContext = !!brand && !isEffectiveKatalystAdmin;
  const brandLabel = hasBrandContext
    ? (brand.displayName || brand.name)
    : "Katalyst Growth Planner";
  const showBrandLogo = hasBrandContext && brand.logoUrl && !logoError;

  const hideAdminNav = isImpersonating || isDemoMode;
  const navItems = [
    { title: "Dashboard", url: "/", icon: Home, visible: true },
    { title: "Brands", url: "/admin/brands", icon: Building2, visible: isRealKatalystAdmin && !hideAdminNav },
    { title: "Invitations", url: "/admin/invitations", icon: Mail, visible: isRealAdmin && !hideAdminNav },
  ].filter((item) => item.visible);

  const displayUser = user._realUser ?? user;
  const initials = displayUser.displayName
    ? displayUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <>
      <Sidebar>
        {showBrandLogo && (
          <SidebarHeader className="p-4">
            <img
              src={brand.logoUrl!}
              alt={brandLabel}
              className="max-h-10 object-contain"
              onError={() => setLogoError(true)}
              data-testid="img-brand-logo"
            />
          </SidebarHeader>
        )}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel data-testid="text-sidebar-label">{brandLabel}</SidebarGroupLabel>
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
          {user.bookingUrl && (
            <div className="px-3 pb-1">
              <Separator className="mb-2" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-muted-foreground"
                onClick={() => window.open(user.bookingUrl, '_blank', 'noopener,noreferrer')}
                data-testid="button-sidebar-book-consultation"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                <span className="truncate">
                  {user.accountManagerName
                    ? `Book with ${user.accountManagerName}`
                    : "Book Consultation"}
                </span>
              </Button>
            </div>
          )}
          {hasBrandContext && (
            <div className="px-3 pb-2">
              <Separator className="mb-2" />
              <p
                className="text-xs"
                style={{ color: "hsl(var(--katalyst-brand))" }}
                data-testid="text-powered-by-katalyst"
              >
                Powered by Katalyst
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              {user.profileImageUrl && (
                <AvatarImage src={user.profileImageUrl} alt={displayUser.displayName || user.email} />
              )}
              <AvatarFallback data-testid="text-sidebar-avatar">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-sidebar-user-name">
                {displayUser.displayName || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-sidebar-user-role">
                {realRole.replace(/_/g, " ")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
              title="Sign out"
              data-testid="button-sidebar-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-logout-title">Sign Out</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-logout-description">
              You'll be signed out. Your plan is always saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-logout-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLogoutDialog(false);
                logout();
              }}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-logout-confirm"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
