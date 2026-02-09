import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Copy, Send, Mail, AlertCircle } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface InvitationWithStatus {
  id: string;
  email: string;
  role: "franchisee" | "franchisor" | "katalyst_admin";
  brandId: string | null;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  status: "pending" | "accepted" | "expired";
  acceptUrl?: string;
}

function roleLabel(role: string): string {
  switch (role) {
    case "franchisee":
      return "Franchisee";
    case "franchisor":
      return "Franchisor";
    case "katalyst_admin":
      return "Katalyst Admin";
    default:
      return role;
  }
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "accepted":
      return "default";
    case "expired":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function InvitationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isFranchisor = user?.role === "franchisor";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const {
    data: invitations,
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useQuery<InvitationWithStatus[]>({
    queryKey: ["/api/invitations"],
  });

  const {
    data: brands,
    isLoading: brandsLoading,
  } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; brand_id?: string }) => {
      const res = await apiRequest("POST", "/api/invitations", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      setEmail("");
      setRole("");
      if (!isFranchisor) setBrandId("");
      setFormErrors([]);
      toast({
        title: "Invitation created",
        description: `Invitation sent to ${data.email}`,
      });
    },
    onError: (error: Error) => {
      let message = "Failed to create invitation";
      try {
        const body = JSON.parse(error.message.substring(error.message.indexOf("{")));
        message = body.message || message;
      } catch {
        const colonIdx = error.message.indexOf(": ");
        if (colonIdx >= 0) {
          try {
            const parsed = JSON.parse(error.message.substring(colonIdx + 2));
            message = parsed.message || message;
          } catch {
            message = error.message.substring(colonIdx + 2) || message;
          }
        }
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!email.trim()) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Please enter a valid email address");
    if (!role) errors.push("Role is required");
    if ((role === "franchisee" || role === "franchisor") && !brandId && !isFranchisor) {
      errors.push("Brand is required for this role");
    }

    setFormErrors(errors);
    if (errors.length > 0) return;

    const payload: { email: string; role: string; brand_id?: string } = { email, role };
    if (isFranchisor && user?.brandId) {
      payload.brand_id = user.brandId;
    } else if (brandId) {
      payload.brand_id = brandId;
    }

    createMutation.mutate(payload);
  };

  const copyLink = async (invitation: InvitationWithStatus) => {
    const url = `${window.location.origin}/invite/${invitation.token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Invitation link copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: url,
        variant: "destructive",
      });
    }
  };

  const brandMap = new Map<string, string>();
  if (brands) {
    for (const b of brands) {
      brandMap.set(b.id, b.name);
    }
  }

  const availableRoles = isFranchisor
    ? [{ value: "franchisee", label: "Franchisee" }]
    : [
        { value: "franchisee", label: "Franchisee" },
        { value: "franchisor", label: "Franchisor" },
        { value: "katalyst_admin", label: "Katalyst Admin" },
      ];

  const showBrandSelector = !isFranchisor && (role === "franchisee" || role === "franchisor");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">
          Invitation Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1" data-testid="text-page-description">
          Create and manage invitations for new users
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium flex items-center gap-2">
            <Send className="h-4 w-4" />
            New Invitation
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-invite-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger data-testid="select-invite-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value} data-testid={`option-role-${r.value}`}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showBrandSelector && (
              <div className="space-y-2">
                <Label htmlFor="invite-brand">Brand</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger data-testid="select-invite-brand">
                    <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((b) => (
                      <SelectItem key={b.id} value={b.id} data-testid={`option-brand-${b.id}`}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formErrors.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-form-errors">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  {formErrors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-send-invitation">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations
          </h2>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <div className="flex items-center justify-center py-8" data-testid="loading-invitations">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitationsError ? (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-invitations-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to load invitations. Please try refreshing.</span>
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8" data-testid="text-empty-invitations">
              No invitations yet. Create one to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id} data-testid={`row-invitation-${inv.id}`}>
                      <TableCell className="font-medium" data-testid={`text-invitation-email-${inv.id}`}>
                        {inv.email}
                      </TableCell>
                      <TableCell data-testid={`text-invitation-role-${inv.id}`}>
                        {roleLabel(inv.role)}
                      </TableCell>
                      <TableCell data-testid={`text-invitation-brand-${inv.id}`}>
                        {inv.brandId ? brandMap.get(inv.brandId) || "Unknown" : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(inv.status)} data-testid={`badge-invitation-status-${inv.id}`}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm" data-testid={`text-invitation-expires-${inv.id}`}>
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {inv.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyLink(inv)}
                            title="Copy invitation link"
                            data-testid={`button-copy-link-${inv.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
