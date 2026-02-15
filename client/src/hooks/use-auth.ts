import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export interface AuthUser {
  id: string;
  email: string;
  role: "franchisee" | "franchisor" | "katalyst_admin";
  brandId: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  onboardingCompleted: boolean;
  preferredTier: "planning_assistant" | "forms" | "quick_entry" | null;
  bookingUrl?: string;
  accountManagerId?: string;
  accountManagerName?: string;
  _mode?: {
    demo: boolean;
    impersonating: boolean;
    demoBrandId?: string;
    editEnabled?: boolean;
  };
  _realUser?: {
    id: string;
    email: string;
    role: string;
    displayName: string | null;
  };
}

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    queryClient.setQueryData(["/api/auth/me"], null);
    window.location.href = "/login";
  };

  const isInDemoMode = !!user?._mode?.demo;
  const isImpersonating = !!user?._mode?.impersonating;
  const realUser = user?._realUser ?? null;

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    isInDemoMode,
    isImpersonating,
    realUser,
  };
}
