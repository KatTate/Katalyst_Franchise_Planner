import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Plus, Building2, ChevronRight, Monitor } from "lucide-react";

const createBrandFormSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  display_name: z.string().max(100).optional(),
});

type CreateBrandForm = z.infer<typeof createBrandFormSchema>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export default function AdminBrandsPage() {
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { enterDemoMode } = useDemoMode();
  const isKatalystAdmin = user?.role === "katalyst_admin";

  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const form = useForm<CreateBrandForm>({
    resolver: zodResolver(createBrandFormSchema),
    defaultValues: { name: "", slug: "", display_name: "" },
  });

  const createBrand = useMutation({
    mutationFn: async (data: CreateBrandForm) => {
      const res = await apiRequest("POST", "/api/brands", data);
      return res.json();
    },
    onSuccess: (brand: Brand) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setShowCreateDialog(false);
      form.reset();
      toast({ title: "Brand created", description: `${brand.name} has been created successfully.` });
      setLocation(`/admin/brands/${brand.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleNameChange = (name: string) => {
    form.setValue("name", name);
    const currentSlug = form.getValues("slug");
    const expectedSlug = slugify(form.getValues("name").slice(0, -1) || "");
    if (!currentSlug || currentSlug === expectedSlug || currentSlug === slugify(name)) {
      form.setValue("slug", slugify(name));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-brands-title">Brand Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure franchise brands and their financial parameters</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-brand">
          <Plus className="h-4 w-4 mr-2" />
          Create New Brand
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !brands?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium" data-testid="text-no-brands">No brands yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first franchise brand to get started</p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)} data-testid="button-create-brand-empty">
              <Plus className="h-4 w-4 mr-2" />
              Create New Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setLocation(`/admin/brands/${brand.id}`)}
              data-testid={`card-brand-${brand.id}`}
            >
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: brand.primaryColor || "hsl(var(--primary))" }}
                  >
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate" data-testid={`text-brand-name-${brand.id}`}>{brand.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{brand.displayName || brand.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isKatalystAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        enterDemoMode(brand.id);
                      }}
                      data-testid={`button-demo-mode-${brand.id}`}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Demo
                    </Button>
                  )}
                  <Badge variant="secondary" data-testid={`badge-brand-slug-${brand.id}`}>{brand.slug}</Badge>
                  {brand.brandParameters ? (
                    <Badge variant="outline">Configured</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Not configured</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-create-brand-title">Create New Brand</DialogTitle>
            <DialogDescription>Set up a new franchise brand. You can configure financial parameters and theming after creation.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createBrand.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g., PostNet"
                        data-testid="input-brand-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., postnet" data-testid="input-brand-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., PostNet Franchise" data-testid="input-brand-display-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel-create-brand">
                  Cancel
                </Button>
                <Button type="submit" disabled={createBrand.isPending} data-testid="button-submit-create-brand">
                  {createBrand.isPending ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
