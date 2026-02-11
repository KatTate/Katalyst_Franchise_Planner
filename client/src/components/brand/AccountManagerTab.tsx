import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import type { Brand } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { Pencil, Trash2, UserPlus, X, Star, Save, Eye } from "lucide-react";

type AccountManager = {
  id: string;
  email: string;
  displayName: string | null;
  profileImageUrl: string | null;
};

type BrandAccountManagerRow = {
  id: string;
  brandId: string;
  accountManagerId: string;
  bookingUrl: string | null;
  createdAt: string;
};

type FranchiseeRow = {
  id: string;
  email: string;
  displayName: string | null;
  accountManagerId: string | null;
  bookingUrl: string | null;
};

export function AccountManagerTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { startImpersonation } = useImpersonation();
  const isKatalystAdmin = user?.role === "katalyst_admin";

  const { data: allAdmins, isLoading: adminsLoading } = useQuery<AccountManager[]>({
    queryKey: ["/api/admin/account-managers"],
  });

  const { data: brandManagers, isLoading: brandManagersLoading } = useQuery<BrandAccountManagerRow[]>({
    queryKey: ["/api/brands", brand.id, "account-managers"],
  });

  const { data: franchisees, isLoading: franchiseesLoading } = useQuery<FranchiseeRow[]>({
    queryKey: ["/api/brands", brand.id, "franchisees"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [addManagerId, setAddManagerId] = useState("");
  const [addBookingUrl, setAddBookingUrl] = useState("");
  const [addBookingUrlError, setAddBookingUrlError] = useState("");
  const [editingBrandManager, setEditingBrandManager] = useState<string | null>(null);
  const [editBrandBookingUrl, setEditBrandBookingUrl] = useState("");
  const [editBrandBookingUrlError, setEditBrandBookingUrlError] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [overrideManagerId, setOverrideManagerId] = useState("");
  const [overrideBookingUrl, setOverrideBookingUrl] = useState("");
  const [overrideBookingUrlError, setOverrideBookingUrlError] = useState("");

  const adminMap = new Map((allAdmins || []).map((m) => [m.id, m]));
  const brandManagerMap = new Map((brandManagers || []).map((bm) => [bm.accountManagerId, bm]));

  function resolveAdminName(id: string | null): string {
    if (!id) return "Unassigned";
    const admin = adminMap.get(id);
    if (!admin) return "Unknown";
    return admin.displayName || admin.email;
  }

  function validateUrl(url: string): boolean {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  }

  const availableToAdd = (allAdmins || []).filter(
    (a) => !brandManagerMap.has(a.id)
  );

  const upsertBrandManager = useMutation({
    mutationFn: async ({ account_manager_id, booking_url }: { account_manager_id: string; booking_url: string | null }) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/account-managers`, { account_manager_id, booking_url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "account-managers"] });
      toast({ title: "Account manager updated", description: "Brand account manager configuration saved." });
      setAddManagerId("");
      setAddBookingUrl("");
      setAddBookingUrlError("");
      setEditingBrandManager(null);
      setEditBrandBookingUrl("");
      setEditBrandBookingUrlError("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeBrandManager = useMutation({
    mutationFn: async (managerId: string) => {
      const res = await apiRequest("DELETE", `/api/brands/${brand.id}/account-managers/${managerId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "account-managers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Manager removed", description: "Account manager removed from this brand." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const setDefaultManager = useMutation({
    mutationFn: async (accountManagerId: string | null) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/default-account-manager`, { account_manager_id: accountManagerId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Default manager updated", description: "New franchisees will be auto-assigned to this manager." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const assignFranchiseeManager = useMutation({
    mutationFn: async ({ userId, account_manager_id, booking_url }: { userId: string; account_manager_id: string; booking_url: string }) => {
      const res = await apiRequest("PUT", `/api/users/${userId}/account-manager`, { account_manager_id, booking_url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "franchisees"] });
      toast({ title: "Account manager assigned", description: "Franchisee account manager has been updated." });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  function openFranchiseeEditDialog(f: FranchiseeRow) {
    setEditingUser(f.id);
    setOverrideManagerId(f.accountManagerId || "");
    const managerBrandUrl = f.accountManagerId ? brandManagerMap.get(f.accountManagerId)?.bookingUrl : null;
    setOverrideBookingUrl(f.bookingUrl || managerBrandUrl || brand.defaultBookingUrl || "");
    setOverrideBookingUrlError("");
  }

  const isLoading = adminsLoading || brandManagersLoading || franchiseesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-4 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-4 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-account-manager-heading">Brand Account Managers</h2>
        <p className="text-sm text-muted-foreground">Configure which account managers work with this brand and their booking URLs</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {(brandManagers || []).length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Booking URL</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(brandManagers || []).map((bm) => {
                  const admin = adminMap.get(bm.accountManagerId);
                  const isDefault = brand.defaultAccountManagerId === bm.accountManagerId;
                  return (
                    <TableRow key={bm.id} data-testid={`row-brand-manager-${bm.accountManagerId}`}>
                      <TableCell className="font-medium" data-testid={`text-brand-manager-name-${bm.accountManagerId}`}>
                        {admin?.displayName || "Unknown"}
                      </TableCell>
                      <TableCell>{admin?.email || "—"}</TableCell>
                      <TableCell>
                        {editingBrandManager === bm.accountManagerId ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editBrandBookingUrl}
                              onChange={(e) => {
                                setEditBrandBookingUrl(e.target.value);
                                setEditBrandBookingUrlError(e.target.value && !validateUrl(e.target.value) ? "Invalid URL" : "");
                              }}
                              placeholder="https://calendly.com/manager"
                              className="max-w-[280px]"
                              data-testid="input-edit-brand-booking-url"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Save booking URL"
                              disabled={!!editBrandBookingUrlError || upsertBrandManager.isPending}
                              onClick={() => upsertBrandManager.mutate({ account_manager_id: bm.accountManagerId, booking_url: editBrandBookingUrl || null })}
                              data-testid="button-save-brand-booking-url"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" aria-label="Cancel edit" onClick={() => setEditingBrandManager(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={bm.bookingUrl ? "text-sm" : "text-muted-foreground text-sm"}
                            data-testid={`text-brand-booking-url-${bm.accountManagerId}`}
                          >
                            {bm.bookingUrl || "Not set"}
                          </span>
                        )}
                        {editBrandBookingUrlError && editingBrandManager === bm.accountManagerId && (
                          <p className="text-sm text-destructive mt-1">{editBrandBookingUrlError}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {isDefault ? (
                          <Badge variant="secondary" data-testid={`badge-default-manager-${bm.accountManagerId}`}>
                            <Star className="h-3 w-3 mr-1" />Default
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultManager.mutate(bm.accountManagerId)}
                            disabled={setDefaultManager.isPending}
                            data-testid={`button-set-default-${bm.accountManagerId}`}
                          >
                            Set as Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit booking URL"
                            onClick={() => {
                              setEditingBrandManager(bm.accountManagerId);
                              setEditBrandBookingUrl(bm.bookingUrl || "");
                              setEditBrandBookingUrlError("");
                            }}
                            data-testid={`button-edit-brand-manager-${bm.accountManagerId}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remove manager"
                            onClick={() => removeBrandManager.mutate(bm.accountManagerId)}
                            disabled={removeBrandManager.isPending}
                            data-testid={`button-remove-brand-manager-${bm.accountManagerId}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {(brandManagers || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-brand-managers">
              No account managers configured for this brand yet
            </p>
          )}

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Account Manager</Label>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Select value={addManagerId} onValueChange={setAddManagerId} data-testid="select-add-brand-manager">
                  <SelectTrigger data-testid="select-add-brand-manager-trigger">
                    <SelectValue placeholder="Select an admin to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((a) => (
                      <SelectItem key={a.id} value={a.id} data-testid={`select-add-manager-option-${a.id}`}>
                        {a.displayName ? `${a.displayName} (${a.email})` : a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Input
                  value={addBookingUrl}
                  onChange={(e) => {
                    setAddBookingUrl(e.target.value);
                    setAddBookingUrlError(e.target.value && !validateUrl(e.target.value) ? "Invalid URL" : "");
                  }}
                  placeholder="Booking URL (optional)"
                  data-testid="input-add-brand-booking-url"
                />
                {addBookingUrlError && <p className="text-sm text-destructive">{addBookingUrlError}</p>}
              </div>
              <Button
                onClick={() => addManagerId && upsertBrandManager.mutate({ account_manager_id: addManagerId, booking_url: addBookingUrl || null })}
                disabled={!addManagerId || !!addBookingUrlError || upsertBrandManager.isPending}
                data-testid="button-add-brand-manager"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold">Franchisee Assignments</h2>
        <p className="text-sm text-muted-foreground">
          New franchisees are auto-assigned the brand's default manager. Override individual assignments below.
        </p>
      </div>

      {!franchisees?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-franchisees">No franchisees for this brand yet</p>
            <p className="text-sm text-muted-foreground mt-1">Invite franchisees to this brand to assign account managers</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Franchisee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account Manager</TableHead>
                <TableHead>Booking URL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
                {isKatalystAdmin && <TableHead className="w-[80px]">View As</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchisees.map((f) => (
                <TableRow key={f.id} data-testid={`row-franchisee-${f.id}`}>
                  <TableCell className="font-medium">{f.displayName || "—"}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell data-testid={`text-manager-name-${f.id}`}>
                    {f.accountManagerId ? (
                      <span>{resolveAdminName(f.accountManagerId)}</span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {f.bookingUrl ? (
                      <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline" data-testid={`link-booking-url-${f.id}`}>
                        {f.bookingUrl}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Edit account manager"
                      onClick={() => openFranchiseeEditDialog(f)}
                      data-testid={`button-assign-manager-${f.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {isKatalystAdmin && (
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`View as ${f.displayName || f.email}`}
                        onClick={() => startImpersonation(f.id)}
                        data-testid={`button-view-as-${f.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Account Manager</DialogTitle>
            <DialogDescription>Change the account manager or booking URL for this franchisee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Manager</Label>
              <Select value={overrideManagerId} onValueChange={(val) => {
                setOverrideManagerId(val);
                const managerBrandUrl = brandManagerMap.get(val)?.bookingUrl;
                if (managerBrandUrl) {
                  setOverrideBookingUrl(managerBrandUrl);
                  setOverrideBookingUrlError("");
                }
              }} data-testid="select-override-manager">
                <SelectTrigger data-testid="select-manager-trigger">
                  <SelectValue placeholder="Select an account manager" />
                </SelectTrigger>
                <SelectContent>
                  {(allAdmins || []).map((m) => (
                    <SelectItem key={m.id} value={m.id} data-testid={`select-manager-option-${m.id}`}>
                      {m.displayName ? `${m.displayName} (${m.email})` : m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Booking URL</Label>
              <Input
                value={overrideBookingUrl}
                onChange={(e) => {
                  setOverrideBookingUrl(e.target.value);
                  setOverrideBookingUrlError(e.target.value && !validateUrl(e.target.value) ? "Must be a valid URL (e.g. https://calendly.com/manager)" : "");
                }}
                placeholder="https://calendly.com/manager"
                data-testid="input-manager-booking-url"
              />
              {overrideBookingUrlError && (
                <p className="text-sm text-destructive" data-testid="text-booking-url-error">{overrideBookingUrlError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel-manager">Cancel</Button>
            <Button
              onClick={() => editingUser && assignFranchiseeManager.mutate({ userId: editingUser, account_manager_id: overrideManagerId, booking_url: overrideBookingUrl })}
              disabled={!overrideManagerId || !overrideBookingUrl || !!overrideBookingUrlError || assignFranchiseeManager.isPending}
              data-testid="button-save-manager"
            >
              {assignFranchiseeManager.isPending ? "Saving..." : "Save Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
