import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Brand } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

function isValidHex(color: string): boolean {
  return /^#([a-f\d]{3}|[a-f\d]{6})$/i.test(color);
}

function normalizeHexForPicker(color: string): string {
  if (/^#[a-f\d]{6}$/i.test(color)) return color;
  if (/^#[a-f\d]{3}$/i.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return "#2563eb";
}

export function BrandIdentityTab({ brand }: { brand: Brand }) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(brand.displayName || "");
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(brand.primaryColor || "#2563eb");
  const [defaultBookingUrl, setDefaultBookingUrl] = useState(brand.defaultBookingUrl || "");
  const [franchisorAck, setFranchisorAck] = useState(brand.franchisorAcknowledgmentEnabled);
  const [colorError, setColorError] = useState("");

  const handleColorTextChange = (value: string) => {
    setPrimaryColor(value);
    if (value && !isValidHex(value)) {
      setColorError("Enter a valid hex color (e.g., #1E3A8A)");
    } else {
      setColorError("");
    }
  };

  const handleColorPickerChange = (value: string) => {
    setPrimaryColor(value);
    setColorError("");
  };

  const handleSave = () => {
    if (primaryColor && !isValidHex(primaryColor)) {
      setColorError("Enter a valid hex color (e.g., #1E3A8A)");
      return;
    }
    updateIdentity.mutate();
  };

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
        <Button onClick={handleSave} disabled={updateIdentity.isPending || !!colorError} data-testid="button-save-identity">
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
                value={normalizeHexForPicker(primaryColor)}
                onChange={(e) => handleColorPickerChange(e.target.value)}
                className="h-9 w-12 rounded-md border cursor-pointer"
                data-testid="input-identity-primary-color"
              />
              <Input
                value={primaryColor}
                onChange={(e) => handleColorTextChange(e.target.value)}
                placeholder="#2563eb"
                className={`flex-1 ${colorError ? "border-destructive" : ""}`}
                data-testid="input-identity-primary-color-hex"
              />
              <div
                className="h-9 w-9 rounded-md border shrink-0"
                style={{ backgroundColor: isValidHex(primaryColor) ? primaryColor : "#ccc" }}
                data-testid="swatch-primary-color"
              />
            </div>
            {colorError ? (
              <p className="text-xs text-destructive" data-testid="text-color-error">{colorError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">This overrides the --primary CSS variable for franchisees of this brand</p>
            )}
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
