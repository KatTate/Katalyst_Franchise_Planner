import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface InvitationInfo {
  email: string;
  role: "franchisee" | "franchisor" | "katalyst_admin";
  brandId: string | null;
  brandName: string | null;
}

interface InvitationError {
  message: string;
  code: "INVALID_TOKEN" | "ALREADY_ACCEPTED" | "EXPIRED";
}

function roleLabel(role: string): string {
  switch (role) {
    case "franchisee": return "Franchisee";
    case "franchisor": return "Franchisor Admin";
    case "katalyst_admin": return "Katalyst Admin";
    default: return role;
  }
}

export default function AcceptInvitationPage() {
  const [, params] = useRoute("/invite/:token");
  const [, setLocation] = useLocation();
  const token = params?.token || "";

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const {
    data: invitation,
    isLoading,
    error: fetchError,
  } = useQuery<InvitationInfo>({
    queryKey: ["/api/invitations/validate", token],
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, display_name: displayName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw { status: res.status, ...data };
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setTimeout(() => setLocation("/"), 1500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!displayName.trim()) errors.push("Display name is required");
    if (password.length < 8) errors.push("Password must be at least 8 characters");
    if (password !== confirmPassword) errors.push("Passwords do not match");

    setFormErrors(errors);
    if (errors.length > 0) return;

    acceptMutation.mutate();
  };

  const errorInfo = parseError(fetchError);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground" data-testid="text-loading">Validating your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold" data-testid="text-error-title">
              {errorInfo.code === "ALREADY_ACCEPTED" ? "Already Accepted" :
               errorInfo.code === "EXPIRED" ? "Invitation Expired" :
               "Invalid Invitation"}
            </h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-error-message">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorInfo.message}</span>
            </div>
            {errorInfo.code === "ALREADY_ACCEPTED" && (
              <Button onClick={() => setLocation("/login")} data-testid="button-go-login">
                Go to Login
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold" data-testid="text-success-title">Account Created</h2>
            <p className="text-muted-foreground text-sm text-center" data-testid="text-success-message">
              Welcome aboard! Redirecting you to the dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-bold" data-testid="text-setup-title">Set Up Your Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your account to get started
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 rounded-md bg-muted text-sm space-y-1" data-testid="invitation-details">
            <p><span className="text-muted-foreground">Email:</span> <span data-testid="text-invite-email">{invitation?.email}</span></p>
            <p><span className="text-muted-foreground">Role:</span> <span data-testid="text-invite-role">{roleLabel(invitation?.role || "")}</span></p>
            {invitation?.brandName && (
              <p><span className="text-muted-foreground">Brand:</span> <span data-testid="text-invite-brand">{invitation.brandName}</span></p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                data-testid="input-display-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>

            {(formErrors.length > 0 || acceptMutation.isError) && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-form-errors">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  {formErrors.map((err, i) => <p key={i}>{err}</p>)}
                  {acceptMutation.isError && (
                    <p>{(acceptMutation.error as any)?.message || "Account creation failed. Please try again."}</p>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" disabled={acceptMutation.isPending} data-testid="button-create-account">
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function parseError(error: unknown): InvitationError | null {
  if (!error) return null;
  try {
    const msg = (error as Error).message || "";
    const jsonStart = msg.indexOf("{");
    if (jsonStart >= 0) {
      return JSON.parse(msg.substring(jsonStart));
    }
    const colonIdx = msg.indexOf(": ");
    if (colonIdx >= 0) {
      const body = msg.substring(colonIdx + 2);
      try {
        return JSON.parse(body);
      } catch {
        return { message: body, code: "INVALID_TOKEN" };
      }
    }
    return { message: msg, code: "INVALID_TOKEN" };
  } catch {
    return { message: "Something went wrong. Please try again.", code: "INVALID_TOKEN" };
  }
}
