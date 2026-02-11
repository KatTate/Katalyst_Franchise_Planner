import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, useSearch } from "wouter";
import type { Brand } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { FinancialParametersTab } from "@/components/brand/FinancialParametersTab";
import { StartupCostTemplateTab } from "@/components/brand/StartupCostTemplateTab";
import { BrandIdentityTab } from "@/components/brand/BrandIdentityTab";
import { AccountManagerTab } from "@/components/brand/AccountManagerTab";

export default function AdminBrandDetailPage() {
  const params = useParams<{ brandId: string }>();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const initialTab = new URLSearchParams(search).get("tab") || "parameters";

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

      <Tabs defaultValue={initialTab}>
        <TabsList data-testid="tabs-brand-sections">
          <TabsTrigger value="parameters" data-testid="tab-parameters">Financial Parameters</TabsTrigger>
          <TabsTrigger value="startup-costs" data-testid="tab-startup-costs">Startup Costs</TabsTrigger>
          <TabsTrigger value="identity" data-testid="tab-identity">Settings</TabsTrigger>
          <TabsTrigger value="account-manager" data-testid="tab-account-manager">Franchisees</TabsTrigger>
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
