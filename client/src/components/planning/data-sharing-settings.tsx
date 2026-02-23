import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useBrandTheme } from "@/hooks/use-brand-theme";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { ConsentStatus } from "@shared/schema";

interface DataSharingSettingsProps {
  planId: string;
}

export function DataSharingSettings({ planId }: DataSharingSettingsProps) {
  const { user } = useAuth();
  const { brand } = useBrandTheme();
  const { toast } = useToast();
  const brandName = brand?.displayName || brand?.name || "your franchisor";
  const isFranchisee = user?.role === "franchisee";

  const { data, isLoading } = useQuery<{ data: ConsentStatus }>({
    queryKey: ["/api/plans", planId, "consent"],
    staleTime: Infinity,
    enabled: isFranchisee,
  });

  const consentStatus = data?.data;

  const grantMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/plans/${planId}/consent/grant`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans", planId, "consent"] });
      toast({ title: "Data sharing enabled", description: `Your financial details are now visible to ${brandName}.` });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enable data sharing",
        description: "Your data remains private. Please try again.",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/plans/${planId}/consent/revoke`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans", planId, "consent"] });
      toast({ title: "Data sharing disabled", description: `${brandName} can no longer see your financial details.` });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to disable data sharing",
        description: "Your sharing status is unchanged. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isFranchisee) {
    return null;
  }

  if (isLoading) {
    return (
      <div data-testid="settings-loading">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-40 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasConsent = consentStatus?.hasConsent ?? false;
  const grantedAt = consentStatus?.grantedAt;
  const isMutating = grantMutation.isPending || revokeMutation.isPending;

  return (
    <div data-testid="data-sharing-settings">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Data Sharing with {brandName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3" data-testid="text-sharing-description">
            <p className="text-sm text-muted-foreground">
              Control whether {brandName} can view your financial plan details. You can change this at any time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">Shared when enabled:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li>Financial projections</li>
                  <li>Startup cost breakdown</li>
                  <li>Generated documents</li>
                  <li>Planning timeline</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">Never shared:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li>AI conversations</li>
                  <li>Personal notes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Current status:</span>
              {hasConsent ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-600" data-testid="badge-sharing-status">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Sharing
                </Badge>
              ) : (
                <Badge variant="secondary" data-testid="badge-sharing-status">
                  <ShieldOff className="h-3.5 w-3.5 mr-1" />
                  Not Sharing
                </Badge>
              )}
              {hasConsent && grantedAt && (
                <span className="text-xs text-muted-foreground" data-testid="text-consent-timestamp">
                  since {new Date(grantedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasConsent ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isMutating}
                    data-testid="button-revoke-consent"
                  >
                    {revokeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShieldOff className="h-4 w-4 mr-2" />
                    )}
                    Stop Sharing
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-testid="dialog-revoke-consent">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Stop Sharing with {brandName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {brandName} will no longer be able to see your financial projections, startup costs, or generated documents. They will still see basic pipeline information (plan name, stage, market, and target open quarter).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revokeMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Stop Sharing
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isMutating}
                    data-testid="button-grant-consent"
                  >
                    {grantMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 mr-2" />
                    )}
                    Share with {brandName}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-testid="dialog-grant-consent">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Share Your Plan with {brandName}?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        <p>This will allow {brandName} to view the following data from your plan:</p>
                        <ul className="list-disc list-inside text-sm space-y-0.5">
                          <li>Financial projections (P&L, Balance Sheet, Cash Flow)</li>
                          <li>Startup cost breakdown</li>
                          <li>Generated documents</li>
                          <li>Planning timeline and milestones</li>
                        </ul>
                        <p className="font-medium">The following will never be shared:</p>
                        <ul className="list-disc list-inside text-sm space-y-0.5">
                          <li>AI conversations</li>
                          <li>Personal notes</li>
                        </ul>
                        <p className="text-xs text-muted-foreground">You can stop sharing at any time from this settings page.</p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => grantMutation.mutate()}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
