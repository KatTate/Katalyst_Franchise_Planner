import { Badge } from "@/components/ui/badge";

type FieldSource = "brand_default" | "user_entry" | "ai_populated";

const SOURCE_CONFIG: Record<FieldSource, { label: string; testId: string; className: string }> = {
  brand_default: {
    label: "Brand Default",
    testId: "source-badge-brand-default",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  user_entry: {
    label: "Your Entry",
    testId: "source-badge-user-entry",
    className: "bg-primary/10 text-primary border-transparent",
  },
  ai_populated: {
    label: "AI-Populated",
    testId: "source-badge-ai-populated",
    className: "border-transparent",
  },
};

interface SourceBadgeProps {
  source: FieldSource;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 h-4 font-normal rounded-md ${config.className}`}
      style={source === "ai_populated" ? { backgroundColor: "#A9A2AA20", color: "#A9A2AA" } : undefined}
      data-testid={config.testId}
    >
      {config.label}
    </Badge>
  );
}
