import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Monitor, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const expired = params.get("expired");
  const [loginError, setLoginError] = useState<string | null>(null);

  const { data: devStatus } = useQuery<{ devMode: boolean }>({
    queryKey: ["/api/auth/dev-enabled"],
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await apiRequest("POST", "/api/auth/login", values);
      return res.json();
    },
    onSuccess: () => {
      setLoginError(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (err: Error) => {
      const msg = err.message;
      if (msg.includes("Invalid email or password")) {
        setLoginError("Invalid email or password");
      } else {
        setLoginError("Something went wrong. Please try again.");
      }
    },
  });

  const devLoginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/dev-login");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground" data-testid="text-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-bold" data-testid="text-app-title">
            Katalyst Growth Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Franchise location planning tool
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {expired === "true" && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted text-muted-foreground text-sm" data-testid="text-session-expired">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}
          {error === "domain_restricted" && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-error-domain">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Only @katgroupinc.com accounts are authorized.</span>
            </div>
          )}
          {error === "auth_failed" && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-error-auth">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Authentication failed. Please try again.</span>
            </div>
          )}
          {loginError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-error-login">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {devStatus?.devMode ? (
            <>
              <Button
                onClick={() => devLoginMutation.mutate()}
                disabled={devLoginMutation.isPending}
                data-testid="button-dev-login"
              >
                <Monitor className="h-4 w-4 mr-2" />
                {devLoginMutation.isPending ? "Signing in..." : "Dev Login (Admin)"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Development mode — Google OAuth not configured
              </p>
            </>
          ) : (
            <>
              <Button
                asChild
                data-testid="button-google-login"
              >
                <a href="/api/auth/google">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </a>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Katalyst team members (@katgroupinc.com)
              </p>
            </>
          )}

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                setLoginError(null);
                loginMutation.mutate(values);
              })}
              className="flex flex-col gap-3"
              data-testid="form-login"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Your password"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Franchisee and franchisor accounts
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
