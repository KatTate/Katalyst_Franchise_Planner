import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { Brand } from "@shared/schema";

function hexToHSL(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hexToForegroundHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "210 10% 98%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.5 ? "210 6% 12%" : "210 10% 98%";
}

const BRAND_CSS_PROPERTIES = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-ring",
] as const;

export function useBrandTheme() {
  const { user } = useAuth();

  const { data: brand } = useQuery<Brand>({
    queryKey: ["/api/brands", user?.brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${user!.brandId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.brandId && user.role !== "katalyst_admin",
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (brand?.primaryColor) {
      const hsl = hexToHSL(brand.primaryColor);
      const foregroundHsl = hexToForegroundHSL(brand.primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty("--primary", hsl);
        document.documentElement.style.setProperty("--primary-foreground", foregroundHsl);
        document.documentElement.style.setProperty("--ring", hsl);
        document.documentElement.style.setProperty("--sidebar-primary", hsl);
        document.documentElement.style.setProperty("--sidebar-primary-foreground", foregroundHsl);
        document.documentElement.style.setProperty("--sidebar-ring", hsl);
      }
    }

    return () => {
      BRAND_CSS_PROPERTIES.forEach((prop) => {
        document.documentElement.style.removeProperty(prop);
      });
    };
  }, [brand?.primaryColor]);

  return { brand };
}
