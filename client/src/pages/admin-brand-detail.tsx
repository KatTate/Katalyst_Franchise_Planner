import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand, BrandParameters, StartupCostTemplate, StartupCostItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

function getDefaultBrandParameters(): BrandParameters {
  return {
    revenue: {
      monthly_auv: { value: 0, label: "Monthly AUV", description: "Average unit volume per month" },
      year1_growth_rate: { value: 0, label: "Year 1 Growth Rate", description: "Annual revenue growth rate for year 1 (decimal, e.g. 0.05 = 5%)" },
      year2_growth_rate: { value: 0, label: "Year 2 Growth Rate", description: "Annual revenue growth rate for year 2+ (decimal)" },
      starting_month_auv_pct: { value: 0, label: "Starting Month AUV %", description: "Percentage of full AUV in the opening month (decimal)" },
    },
    operating_costs: {
      cogs_pct: { value: 0, label: "COGS %", description: "Cost of goods sold as percentage of revenue (decimal)" },
      labor_pct: { value: 0, label: "Labor %", description: "Labor cost as percentage of revenue (decimal)" },
      rent_monthly: { value: 0, label: "Monthly Rent", description: "Monthly rent payment" },
      utilities_monthly: { value: 0, label: "Monthly Utilities", description: "Monthly utilities cost" },
      insurance_monthly: { value: 0, label: "Monthly Insurance", description: "Monthly insurance cost" },
      marketing_pct: { value: 0, label: "Marketing %", description: "Local marketing as percentage of revenue (decimal)" },
      royalty_pct: { value: 0, label: "Royalty %", description: "Franchise royalty as percentage of revenue (decimal)" },
      ad_fund_pct: { value: 0, label: "Ad Fund %", description: "National ad fund as percentage of revenue (decimal)" },
      other_monthly: { value: 0, label: "Other Monthly", description: "Other recurring monthly expenses" },
    },
    financing: {
      loan_amount: { value: 0, label: "Loan Amount", description: "Default loan amount" },
      interest_rate: { value: 0, label: "Interest Rate", description: "Annual interest rate (decimal, e.g. 0.07 = 7%)" },
      loan_term_months: { value: 0, label: "Loan Term (months)", description: "Loan term in months" },
      down_payment_pct: { value: 0, label: "Down Payment %", description: "Down payment as percentage of total investment (decimal)" },
    },
    startup_capital: {
      working_capital_months: { value: 0, label: "Working Capital (months)", description: "Number of months of working capital reserve" },
      depreciation_years: { value: 0, label: "Depreciation (years)", description: "CapEx depreciation period in years" },
    },
  };
}

function FinancialParametersTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const params = brand.brandParameters || getDefaultBrandParameters();
  const [formData, setFormData] = useState<BrandParameters>(params);

  const updateParams = useMutation({
    mutationFn: async (data: BrandParameters) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/parameters`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Parameters saved", description: "Financial parameters have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateField = (category: keyof BrandParameters, field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: {
          ...(prev[category] as any)[field],
          value,
        },
      },
    }));
  };

  const renderParameterCategory = (
    category: keyof BrandParameters,
    title: string,
    fields: Record<string, { value: number; label: string; description: string }>
  ) => (
    <Card key={category}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(fields).map(([key, field]) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <div className="sm:col-span-1">
              <Label htmlFor={`param-${category}-${key}`} className="text-sm font-medium">{field.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
            </div>
            <div className="sm:col-span-2">
              <Input
                id={`param-${category}-${key}`}
                type="number"
                step="any"
                value={field.value}
                onChange={(e) => updateField(category, key, parseFloat(e.target.value) || 0)}
                data-testid={`input-param-${category}-${key}`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Financial Parameters</h2>
          <p className="text-sm text-muted-foreground">Configure the default seed values for this brand's financial engine</p>
        </div>
        <Button onClick={() => updateParams.mutate(formData)} disabled={updateParams.isPending} data-testid="button-save-parameters">
          <Save className="h-4 w-4 mr-2" />
          {updateParams.isPending ? "Saving..." : "Save Parameters"}
        </Button>
      </div>

      {renderParameterCategory("revenue", "Revenue", formData.revenue)}
      {renderParameterCategory("operating_costs", "Operating Costs", formData.operating_costs)}
      {renderParameterCategory("financing", "Financing", formData.financing)}
      {renderParameterCategory("startup_capital", "Startup & Capital", formData.startup_capital)}
    </div>
  );
}

const startupCostFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  default_amount: z.number().min(0, "Amount must be positive"),
  capex_classification: z.enum(["capex", "non_capex", "working_capital"]),
  item7_range_low: z.number().min(0).nullable(),
  item7_range_high: z.number().min(0).nullable(),
}).refine(
  (data) => {
    if (data.item7_range_low !== null && data.item7_range_high !== null) {
      return data.item7_range_low <= data.item7_range_high;
    }
    return true;
  },
  { message: "Low range must be less than or equal to high range", path: ["item7_range_high"] }
);

type StartupCostFormData = z.infer<typeof startupCostFormSchema>;

function StartupCostTemplateTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [items, setItems] = useState<StartupCostItem[]>(brand.startupCostTemplate || []);
  const [editingItem, setEditingItem] = useState<StartupCostItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const form = useForm<StartupCostFormData>({
    resolver: zodResolver(startupCostFormSchema),
    defaultValues: { name: "", default_amount: 0, capex_classification: "capex", item7_range_low: null, item7_range_high: null },
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: StartupCostTemplate) => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/startup-cost-template`, template);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Template saved", description: "Startup cost template has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddItem = (data: StartupCostFormData) => {
    const newItem: StartupCostItem = {
      id: crypto.randomUUID(),
      name: data.name,
      default_amount: data.default_amount,
      capex_classification: data.capex_classification,
      item7_range_low: data.item7_range_low,
      item7_range_high: data.item7_range_high,
      sort_order: items.length,
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveTemplate.mutate(updated);
    setShowAddDialog(false);
    form.reset();
  };

  const handleEditItem = (data: StartupCostFormData) => {
    if (!editingItem) return;
    const updated = items.map((item) =>
      item.id === editingItem.id
        ? { ...item, ...data }
        : item
    );
    setItems(updated);
    saveTemplate.mutate(updated);
    setEditingItem(null);
    form.reset();
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id).map((item, i) => ({ ...item, sort_order: i }));
    setItems(updated);
    saveTemplate.mutate(updated);
    setDeleteItemId(null);
  };

  const openEditDialog = (item: StartupCostItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      default_amount: item.default_amount,
      capex_classification: item.capex_classification,
      item7_range_low: item.item7_range_low,
      item7_range_high: item.item7_range_high,
    });
  };

  const openAddDialog = () => {
    form.reset({ name: "", default_amount: 0, capex_classification: "capex", item7_range_low: null, item7_range_high: null });
    setShowAddDialog(true);
  };

  const formatCurrency = (n: number | null) => n !== null ? `$${n.toLocaleString()}` : "—";

  const deleteTarget = items.find((i) => i.id === deleteItemId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Startup Cost Template</h2>
          <p className="text-sm text-muted-foreground">Define the default line items franchisees see when creating a plan</p>
        </div>
        <Button onClick={openAddDialog} data-testid="button-add-line-item">
          <Plus className="h-4 w-4 mr-2" />
          Add Line Item
        </Button>
      </div>

      {!items.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-startup-costs">No startup cost items yet</p>
            <Button className="mt-4" variant="outline" onClick={openAddDialog} data-testid="button-add-first-item">
              <Plus className="h-4 w-4 mr-2" />
              Add First Line Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Default Amount</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-right">Item 7 Low</TableHead>
                <TableHead className="text-right">Item 7 High</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} data-testid={`row-startup-cost-${item.id}`}>
                  <TableCell className="font-medium" data-testid={`text-cost-name-${item.id}`}>{item.name}</TableCell>
                  <TableCell className="text-right" data-testid={`text-cost-amount-${item.id}`}>{formatCurrency(item.default_amount)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" data-testid={`badge-cost-class-${item.id}`}>
                      {item.capex_classification === "capex" ? "CapEx" : item.capex_classification === "non_capex" ? "Non-CapEx" : "Working Capital"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.item7_range_low)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.item7_range_high)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(item)} data-testid={`button-edit-cost-${item.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteItemId(item.id)} data-testid={`button-delete-cost-${item.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showAddDialog || !!editingItem} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingItem(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-cost-dialog-title">{editingItem ? "Edit Line Item" : "Add Line Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details for this startup cost item." : "Add a new startup cost line item to the template."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingItem ? handleEditItem : handleAddItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Leasehold Improvements" data-testid="input-cost-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-cost-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capex_classification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CapEx Classification</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-cost-classification">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="capex">CapEx (depreciated over time)</SelectItem>
                        <SelectItem value="non_capex">Non-CapEx (expensed in Year 1)</SelectItem>
                        <SelectItem value="working_capital">Working Capital</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>CapEx costs are depreciated; non-CapEx costs are expensed in Year 1</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="item7_range_low"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item 7 Low ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Optional"
                          data-testid="input-cost-item7-low"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="item7_range_high"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item 7 High ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="Optional"
                          data-testid="input-cost-item7-high"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowAddDialog(false); setEditingItem(null); }}>Cancel</Button>
                <Button type="submit" disabled={saveTemplate.isPending} data-testid="button-save-cost-item">
                  {saveTemplate.isPending ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => { if (!open) setDeleteItemId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Line Item</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &ldquo;{deleteTarget?.name}&rdquo; from the template? This will not affect existing plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-cost">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-confirm-delete-cost"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BrandIdentityTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(brand.displayName || "");
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(brand.primaryColor || "#2563eb");
  const [defaultBookingUrl, setDefaultBookingUrl] = useState(brand.defaultBookingUrl || "");
  const [franchisorAck, setFranchisorAck] = useState(brand.franchisorAcknowledgmentEnabled);

  const updateIdentity = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/brands/${brand.id}/identity`, {
        display_name: displayName || null,
        logo_url: logoUrl || null,
        primary_color: primaryColor || null,
        default_booking_url: defaultBookingUrl || null,
        franchisor_acknowledgment_enabled: franchisorAck,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id] });
      toast({ title: "Identity saved", description: "Brand identity has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Brand Identity</h2>
          <p className="text-sm text-muted-foreground">Configure the visual identity and settings for this brand</p>
        </div>
        <Button onClick={() => updateIdentity.mutate()} disabled={updateIdentity.isPending} data-testid="button-save-identity">
          <Save className="h-4 w-4 mr-2" />
          {updateIdentity.isPending ? "Saving..." : "Save Identity"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Visual Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identity-display-name">Display Name</Label>
            <Input
              id="identity-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., PostNet Franchise"
              data-testid="input-identity-display-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity-logo-url">Logo URL</Label>
            <Input
              id="identity-logo-url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              data-testid="input-identity-logo-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identity-primary-color">Primary Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="identity-primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-12 rounded-md border cursor-pointer"
                data-testid="input-identity-primary-color"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
                data-testid="input-identity-primary-color-hex"
              />
              <div
                className="h-9 w-9 rounded-md border shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <p className="text-xs text-muted-foreground">This overrides the --primary CSS variable for franchisees of this brand</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brand Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identity-booking-url">Default Booking URL</Label>
            <Input
              id="identity-booking-url"
              value={defaultBookingUrl}
              onChange={(e) => setDefaultBookingUrl(e.target.value)}
              placeholder="https://calendly.com/your-team"
              data-testid="input-identity-booking-url"
            />
            <p className="text-xs text-muted-foreground">Fallback booking URL when no specific account manager is assigned</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Franchisor Acknowledgment</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Allow franchisor to review and acknowledge franchisee plans</p>
            </div>
            <Switch
              checked={franchisorAck}
              onCheckedChange={setFranchisorAck}
              data-testid="switch-franchisor-ack"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountManagerTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();

  const { data: franchisees, isLoading: franchiseesLoading } = useQuery<Array<{
    id: string;
    email: string;
    displayName: string | null;
    accountManagerId: string | null;
    bookingUrl: string | null;
  }>>({
    queryKey: ["/api/brands", brand.id, "franchisees"],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${brand.id}/franchisees`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load franchisees");
      return res.json();
    },
  });

  const { data: allUsers } = useQuery<Array<{
    id: string;
    email: string;
    displayName: string | null;
    role: string;
  }>>({
    queryKey: ["/api/brands", brand.id, "users"],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${brand.id}/franchisees`, { credentials: "include" });
      return res.json();
    },
    enabled: false,
  });

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState("");
  const [managerId, setManagerId] = useState("");

  const assignManager = useMutation({
    mutationFn: async ({ userId, account_manager_id, booking_url }: { userId: string; account_manager_id: string; booking_url: string }) => {
      const res = await apiRequest("PUT", `/api/users/${userId}/account-manager`, { account_manager_id, booking_url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands", brand.id, "franchisees"] });
      toast({ title: "Account manager assigned", description: "The account manager has been updated." });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Account Manager Assignment</h2>
        <p className="text-sm text-muted-foreground">Assign account managers and booking URLs to franchisees</p>
      </div>

      {franchiseesLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : !franchisees?.length ? (
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
                <TableHead>Booking URL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchisees.map((f) => (
                <TableRow key={f.id} data-testid={`row-franchisee-${f.id}`}>
                  <TableCell className="font-medium">{f.displayName || "—"}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{f.bookingUrl || "—"}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingUser(f.id);
                        setBookingUrl(f.bookingUrl || brand.defaultBookingUrl || "");
                        setManagerId(f.accountManagerId || "");
                      }}
                      data-testid={`button-assign-manager-${f.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Account Manager</DialogTitle>
            <DialogDescription>Set the account manager and their booking URL for this franchisee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Manager ID</Label>
              <Input
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                placeholder="Enter account manager user ID"
                data-testid="input-manager-id"
              />
            </div>
            <div className="space-y-2">
              <Label>Booking URL</Label>
              <Input
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                placeholder="https://calendly.com/manager"
                data-testid="input-manager-booking-url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button
              onClick={() => editingUser && assignManager.mutate({ userId: editingUser, account_manager_id: managerId, booking_url: bookingUrl })}
              disabled={!managerId || !bookingUrl || assignManager.isPending}
              data-testid="button-save-manager"
            >
              {assignManager.isPending ? "Saving..." : "Assign Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminBrandDetailPage() {
  const params = useParams<{ brandId: string }>();
  const [, setLocation] = useLocation();

  const { data: brand, isLoading, error } = useQuery<Brand>({
    queryKey: ["/api/brands", params.brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${params.brandId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Brand not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/admin/brands")} data-testid="button-back-to-brands">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Brands
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive font-medium">Brand not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/brands")} data-testid="button-back-to-brands">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-brand-detail-title">{brand.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{brand.slug}</Badge>
            {brand.displayName && brand.displayName !== brand.name && (
              <span className="text-sm text-muted-foreground">{brand.displayName}</span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="parameters">
        <TabsList data-testid="tabs-brand-sections">
          <TabsTrigger value="parameters" data-testid="tab-parameters">Financial Parameters</TabsTrigger>
          <TabsTrigger value="startup-costs" data-testid="tab-startup-costs">Startup Costs</TabsTrigger>
          <TabsTrigger value="identity" data-testid="tab-identity">Brand Identity</TabsTrigger>
          <TabsTrigger value="account-manager" data-testid="tab-account-manager">Account Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="mt-4">
          <FinancialParametersTab brand={brand} />
        </TabsContent>
        <TabsContent value="startup-costs" className="mt-4">
          <StartupCostTemplateTab brand={brand} />
        </TabsContent>
        <TabsContent value="identity" className="mt-4">
          <BrandIdentityTab brand={brand} />
        </TabsContent>
        <TabsContent value="account-manager" className="mt-4">
          <AccountManagerTab brand={brand} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
