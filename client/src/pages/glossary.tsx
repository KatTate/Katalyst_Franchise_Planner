import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { GlossaryTerm } from "@shared/help-content";

const STATEMENT_TAB_LABELS: Record<string, string> = {
  pnl: "P&L",
  "balance-sheet": "Balance Sheet",
  "cash-flow": "Cash Flow",
  roic: "ROIC",
  valuation: "Valuation",
  summary: "Summary",
};

interface BrandData {
  id: string;
  brandParameters: Record<string, Record<string, { label: string; value: number; description: string }>>;
}

const BRAND_PARAM_KEY_MAP: Record<string, { category: string; key: string }> = {
  ebitdaMultiple: { category: "valuation", key: "ebitda_multiple" },
  monthlyAuv: { category: "revenue", key: "monthly_auv" },
  laborPct: { category: "operating_costs", key: "labor_pct" },
};

function getBrandBenchmark(brand: BrandData | undefined, paramKey: string | null): { label: string; value: number } | null {
  if (!brand || !paramKey) return null;
  const mapping = BRAND_PARAM_KEY_MAP[paramKey];
  if (!mapping) return null;
  const param = brand.brandParameters?.[mapping.category]?.[mapping.key];
  if (!param) return null;
  return { label: param.label, value: param.value };
}

function formatBenchmarkValue(value: number, paramKey: string): string {
  if (paramKey === "monthlyAuv") return `$${(value / 100).toLocaleString()}`;
  if (paramKey.endsWith("Pct") || paramKey.endsWith("Rate")) return `${(value * 100).toFixed(1)}%`;
  if (paramKey === "ebitdaMultiple") return `${value}x`;
  return String(value);
}

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/glossary/:slug");
  const { user } = useAuth();

  useEffect(() => {
    if (params?.slug) {
      setSelectedSlug(params.slug);
    }
  }, [params?.slug]);

  const { data: terms, isLoading } = useQuery<GlossaryTerm[]>({
    queryKey: ["/api/help/glossary"],
  });

  const { data: brand } = useQuery<BrandData>({
    queryKey: ["/api/brands", user?.brandId],
    enabled: !!user?.brandId,
  });

  const { data: plans } = useQuery<{ id: string }[]>({
    queryKey: ["/api/plans"],
    enabled: !!user,
  });

  const activePlanId = plans?.[0]?.id ?? null;

  const filtered = useMemo(() => {
    if (!terms) return [];
    if (!searchQuery.trim()) return terms;
    const lower = searchQuery.toLowerCase();
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(lower) ||
        t.definition.toLowerCase().includes(lower)
    );
  }, [terms, searchQuery]);

  const selectedTerm = useMemo(() => {
    if (!selectedSlug || !terms) return null;
    return terms.find((t) => t.slug === selectedSlug) ?? null;
  }, [selectedSlug, terms]);

  return (
    <div className="space-y-6" data-testid="page-glossary">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-glossary-back"
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-glossary-title">
            <BookOpen className="h-6 w-6 shrink-0" />
            Financial Glossary
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Key financial terms and how they apply to your franchise plan
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (selectedSlug) {
              setSelectedSlug(null);
              setLocation("/glossary");
            }
          }}
          className="pl-9"
          data-testid="input-glossary-search"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedTerm ? (
        <GlossaryDetail
          term={selectedTerm}
          allTerms={terms ?? []}
          brand={brand}
          activePlanId={activePlanId}
          onBack={() => { setSelectedSlug(null); setLocation("/glossary"); }}
          onSelectTerm={(slug) => { setSelectedSlug(slug); setLocation(`/glossary/${slug}`); }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm col-span-full" data-testid="text-glossary-empty">
              No terms match your search.
            </p>
          ) : (
            filtered.map((term) => (
              <Card
                key={term.slug}
                className="hover-elevate cursor-pointer"
                onClick={() => { setSelectedSlug(term.slug); setLocation(`/glossary/${term.slug}`); }}
                data-testid={`glossary-term-${term.slug}`}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{term.term}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {term.definition}
                  </p>
                  {term.statementTab && (
                    <Badge variant="secondary" className="mt-2" data-testid={`badge-tab-${term.slug}`}>
                      {STATEMENT_TAB_LABELS[term.statementTab] ?? term.statementTab}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface GlossaryDetailProps {
  term: GlossaryTerm;
  allTerms: GlossaryTerm[];
  brand: BrandData | undefined;
  activePlanId: string | null;
  onBack: () => void;
  onSelectTerm: (slug: string) => void;
}

function GlossaryDetail({ term, allTerms, brand, activePlanId, onBack, onSelectTerm }: GlossaryDetailProps) {
  const [, setLocation] = useLocation();

  const relatedTermObjects = useMemo(() => {
    return term.relatedTerms
      .map((slug) => allTerms.find((t) => t.slug === slug))
      .filter(Boolean) as GlossaryTerm[];
  }, [term.relatedTerms, allTerms]);

  const benchmark = getBrandBenchmark(brand, term.brandParameterKey);

  return (
    <div className="max-w-2xl space-y-4" data-testid={`glossary-detail-${term.slug}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        data-testid="button-glossary-back-to-list"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to list
      </Button>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold" data-testid="text-glossary-detail-term">
              {term.term}
            </h2>
            {term.statementTab && (
              <Badge variant="secondary" data-testid="badge-detail-tab">
                {STATEMENT_TAB_LABELS[term.statementTab] ?? term.statementTab}
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Definition</h3>
            <p className="text-sm" data-testid="text-glossary-detail-definition">
              {term.definition}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">How It's Calculated</h3>
            <p className="text-sm" data-testid="text-glossary-detail-calculation">
              {term.calculation}
            </p>
          </div>

          {benchmark && (
            <div data-testid={`benchmark-${term.slug}`}>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Brand Benchmark</h3>
              <p className="text-sm">
                <span className="font-medium">{benchmark.label}:</span>{" "}
                <span className="font-mono tabular-nums">
                  {formatBenchmarkValue(benchmark.value, term.brandParameterKey!)}
                </span>
              </p>
            </div>
          )}

          {term.statementTab && activePlanId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/plans/${activePlanId}${term.statementTab ? `?tab=${term.statementTab}` : ""}`)}
              data-testid={`link-see-in-plan-${term.slug}`}
            >
              See it in your plan
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}

          {relatedTermObjects.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Related Terms</h3>
              <div className="flex gap-2 flex-wrap">
                {relatedTermObjects.map((related) => (
                  <Badge
                    key={related.slug}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onSelectTerm(related.slug)}
                    data-testid={`related-term-${related.slug}`}
                  >
                    {related.term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
