import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCents } from "@/lib/format-currency";
import { useColumnManager, ColumnToolbar, GroupedTableHead } from "./column-manager";
import { ComparisonTableHead, buildComparisonColumns, type ComparisonColumnDef } from "./comparison-table-head";
import { InlineEditableCell } from "./inline-editable-cell";
import { INPUT_FIELD_MAP, isEditableRow } from "./input-field-map";
import { SCENARIO_COLORS, type ScenarioId, type ScenarioOutputs } from "@/lib/scenario-engine";
import type { EngineOutput, MonthlyProjection, AnnualSummary, PLAnalysisOutput, PlanFinancialInputs, FinancialFieldValue } from "@shared/financial-engine";
import type { ColumnDef } from "./column-manager";
import { getAnnualValue, getQuarterlyValue, getMonthlyValue } from "./column-manager";
import { parseFieldInput, formatFieldValue } from "@/lib/field-metadata";
import type { FormatType } from "@/lib/field-metadata";

interface PnlTabProps {
  output: EngineOutput;
  financialInputs?: PlanFinancialInputs | null;
  onCellEdit?: (category: string, fieldName: string, rawInput: string, inputFormat: FormatType) => void;
  isSaving?: boolean;
  scenarioOutputs?: ScenarioOutputs | null;
  brandName?: string;
}

interface CellTooltip {
  explanation: string;
  formula: string;
}

interface PnlRowDef {
  key: string;
  label: string;
  field: string;
  format: "currency" | "pct";
  isInput?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isExpense?: boolean;
  indent?: number;
  interpretationId?: string;
  interpretation?: (enriched: EnrichedAnnual[], financialInputs?: PlanFinancialInputs | null, brandName?: string) => string | null;
  tooltip?: CellTooltip;
}

interface PnlSectionDef {
  key: string;
  title: string;
  rows: PnlRowDef[];
  defaultExpanded?: boolean;
}

type EnrichedAnnual = AnnualSummary & {
  monthlyRevenue: number;
  cogsPct: number;
  materialsCogs: number;
  royalties: number;
  adFund: number;
  directLaborPct: number;
  managementSalaries: number;
  payrollTaxBenefits: number;
  facilities: number;
  marketing: number;
  discretionaryMarketing: number;
  otherOpex: number;
};

function computeEnrichedAnnuals(monthly: MonthlyProjection[], annuals: AnnualSummary[]): EnrichedAnnual[] {
  return annuals.map((a) => {
    const yearMonths = monthly.filter((m) => m.year === a.year);
    const sum = (fn: (m: MonthlyProjection) => number) => yearMonths.reduce((s, m) => s + fn(m), 0);
    const revenue = a.revenue;
    const annualMarketing = sum((m) => m.marketing);
    return {
      ...a,
      monthlyRevenue: yearMonths.length > 0 ? Math.round(revenue / yearMonths.length) : 0,
      cogsPct: revenue !== 0 ? a.totalCogs / revenue : 0,
      materialsCogs: sum((m) => m.materialsCogs),
      royalties: sum((m) => m.royalties),
      adFund: sum((m) => m.adFund),
      directLaborPct: revenue !== 0 ? a.directLabor / revenue : 0,
      managementSalaries: sum((m) => m.managementSalaries),
      payrollTaxBenefits: sum((m) => m.payrollTaxBenefits),
      facilities: sum((m) => m.facilities),
      marketing: annualMarketing,
      discretionaryMarketing: annualMarketing,
      otherOpex: sum((m) => m.otherOpex),
    };
  });
}

const PNL_SECTIONS: PnlSectionDef[] = [
  {
    key: "revenue",
    title: "Revenue",
    rows: [
      { key: "monthly-revenue", label: "Monthly Revenue", field: "monthlyRevenue", format: "currency", isInput: true },
      { key: "annual-revenue", label: "Annual Revenue", field: "revenue", format: "currency", isSubtotal: true, tooltip: { explanation: "Total revenue earned during the year", formula: "Sum of monthly revenue" } },
    ],
  },
  {
    key: "cogs",
    title: "Cost of Sales",
    rows: [
      { key: "cogs-pct", label: "COGS %", field: "cogsPct", format: "pct", isInput: true },
      { key: "materials-cogs", label: "Materials / COGS", field: "materialsCogs", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Direct materials cost based on your COGS percentage", formula: "Revenue x COGS %" } },
      { key: "royalties", label: "Royalties", field: "royalties", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Franchise royalty fees paid to the brand", formula: "Revenue x Royalty rate" } },
      { key: "ad-fund", label: "Ad Fund", field: "adFund", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Required advertising fund contribution", formula: "Revenue x Ad fund rate" } },
      {
        key: "total-cogs",
        label: "Total Cost of Sales",
        field: "totalCogs",
        format: "currency",
        isSubtotal: true,
        isExpense: true,
        tooltip: { explanation: "All costs directly tied to generating revenue", formula: "Materials + Royalties + Ad Fund" },
        interpretationId: "interp-total-cogs",
        interpretation: (enriched, financialInputs, brandName) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const cogsPct = (y1.cogsPct * 100).toFixed(1);
          const brandDefault = financialInputs?.operatingCosts?.cogsPct?.brandDefault;
          if (brandDefault != null) {
            const brandPct = (brandDefault * 100).toFixed(1);
            const diff = y1.cogsPct * 100 - brandDefault * 100;
            if (Math.abs(diff) < 1) return `COGS at ${cogsPct}% of revenue — in line with ${brandName || "brand"} default of ${brandPct}%`;
            if (diff > 0) return `COGS at ${cogsPct}% of revenue — ${diff.toFixed(1)}pp above ${brandName || "brand"} default of ${brandPct}%`;
            return `COGS at ${cogsPct}% of revenue — ${Math.abs(diff).toFixed(1)}pp below ${brandName || "brand"} default of ${brandPct}%`;
          }
          return `COGS at ${cogsPct}% of revenue`;
        },
      },
    ],
  },
  {
    key: "gross-profit",
    title: "Gross Profit",
    rows: [
      {
        key: "gross-profit",
        label: "Gross Profit",
        field: "grossProfit",
        format: "currency",
        isSubtotal: true,
        tooltip: { explanation: "Revenue remaining after cost of sales", formula: "Revenue - Total Cost of Sales" },
        interpretationId: "interp-gross-profit",
        interpretation: (enriched, financialInputs, brandName) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const pct = (y1.grossProfitPct * 100).toFixed(1);
          const pctNum = y1.grossProfitPct * 100;
          const cogsBrandDefault = financialInputs?.operatingCosts?.cogsPct?.brandDefault;
          if (cogsBrandDefault != null) {
            const expectedMargin = ((1 - cogsBrandDefault) * 100).toFixed(1);
            if (pctNum >= Number(expectedMargin) - 2) return `${pct}% gross margin in Year 1 — in line with ${brandName || "brand"} expectations`;
            return `${pct}% gross margin in Year 1 — below typical ${expectedMargin}% for ${brandName || "brand"}`;
          }
          if (pctNum >= 60) return `${pct}% gross margin in Year 1 — strong margin to cover operating expenses`;
          if (pctNum >= 40) return `${pct}% gross margin in Year 1 — moderate margin, keep cost of sales controlled`;
          return `${pct}% gross margin in Year 1 — tight margin, review cost of sales assumptions`;
        },
      },
      { key: "gp-pct", label: "Gross Margin %", field: "grossProfitPct", format: "pct", tooltip: { explanation: "Percentage of revenue retained after cost of sales", formula: "Gross Profit / Revenue" } },
    ],
  },
  {
    key: "opex",
    title: "Operating Expenses",
    rows: [
      { key: "direct-labor", label: "Direct Labor", field: "directLabor", format: "currency", isInput: true, isExpense: true, indent: 1 },
      { key: "dl-pct", label: "Direct Labor %", field: "directLaborPct", format: "pct", isInput: true, indent: 1 },
      { key: "mgmt-salaries", label: "Management Salaries", field: "managementSalaries", format: "currency", isInput: true, isExpense: true, indent: 1 },
      { key: "payroll-tax", label: "Payroll Tax & Benefits", field: "payrollTaxBenefits", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Employer payroll taxes and employee benefits", formula: "(Direct Labor + Mgmt Salaries) x Payroll Tax rate" } },
      { key: "facilities", label: "Facilities", field: "facilities", format: "currency", isInput: true, isExpense: true, indent: 1 },
      { key: "marketing", label: "Marketing / Advertising", field: "marketing", format: "currency", isInput: true, isExpense: true, indent: 1 },
      { key: "disc-marketing", label: "Discretionary Marketing", field: "discretionaryMarketing", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Owner-directed marketing spend beyond required brand contributions", formula: "Same as Marketing in current model" } },
      { key: "other-opex", label: "Other OpEx", field: "otherOpex", format: "currency", isInput: true, isExpense: true, indent: 1 },
      { key: "total-opex", label: "Total Operating Expenses", field: "totalOpex", format: "currency", isSubtotal: true, isExpense: true, tooltip: { explanation: "Total cost of running the business day-to-day", formula: "Sum of all operating expense line items" } },
    ],
  },
  {
    key: "ebitda",
    title: "EBITDA",
    rows: [
      { key: "ebitda", label: "EBITDA", field: "ebitda", format: "currency", isSubtotal: true, tooltip: { explanation: "Earnings before interest, taxes, depreciation, and amortization", formula: "Gross Profit - Total Operating Expenses" } },
      { key: "ebitda-pct", label: "EBITDA Margin %", field: "ebitdaPct", format: "pct", tooltip: { explanation: "EBITDA as a percentage of revenue", formula: "EBITDA / Revenue" } },
    ],
  },
  {
    key: "below-ebitda",
    title: "Below EBITDA",
    rows: [
      { key: "depreciation", label: "Depreciation & Amortization", field: "depreciation", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Non-cash expense spreading equipment cost over its useful life", formula: "CapEx / Depreciation years" } },
      { key: "interest", label: "Interest Expense", field: "interestExpense", format: "currency", indent: 1, isExpense: true, tooltip: { explanation: "Cost of borrowing on your loan balance", formula: "Average loan balance x Interest rate" } },
    ],
  },
  {
    key: "pretax",
    title: "Pre-Tax Income",
    rows: [
      {
        key: "pretax-income",
        label: "Pre-Tax Income",
        field: "preTaxIncome",
        format: "currency",
        isTotal: true,
        tooltip: { explanation: "Your bottom-line profit before taxes", formula: "EBITDA - Depreciation - Interest Expense" },
        interpretationId: "interp-pretax-income",
        interpretation: (enriched) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const pct = (y1.preTaxIncomePct * 100).toFixed(1);
          if (y1.preTaxIncome < 0) return `${pct}% pre-tax margin in Year 1 — projected loss, review expenses and ramp-up timeline`;
          if (y1.preTaxIncomePct < 0.05) return `${pct}% pre-tax margin in Year 1 — thin margin, small changes in revenue or costs could swing profitability`;
          return `${pct}% pre-tax margin in Year 1 — healthy profit margin`;
        },
      },
      { key: "pretax-pct", label: "Pre-Tax Margin %", field: "preTaxIncomePct", format: "pct", tooltip: { explanation: "Pre-tax profit as a percentage of revenue", formula: "Pre-Tax Income / Revenue" } },
    ],
  },
  {
    key: "pl-analysis",
    title: "P&L Analysis",
    defaultExpanded: false,
    rows: [
      { key: "adj-pretax", label: "Adjusted Pre-Tax Profit", field: "adjustedPreTaxProfit", format: "currency", tooltip: { explanation: "Pre-tax income adjusted for owner compensation", formula: "Pre-Tax Income + Owner salary adjustment" } },
      { key: "target-pretax", label: "Target Pre-Tax Profit", field: "targetPreTaxProfit", format: "currency", tooltip: { explanation: "The profit level your plan should aim for", formula: "Revenue x Target Pre-Tax Profit %" } },
      { key: "above-below-target", label: "Above / Below Target", field: "aboveBelowTarget", format: "currency", tooltip: { explanation: "How far your adjusted profit is from the target", formula: "Adjusted Pre-Tax - Target Pre-Tax" } },
      { key: "salary-cap", label: "Salary Cap at Target", field: "salaryCapAtTarget", format: "currency", tooltip: { explanation: "Maximum owner salary to still hit the target profit", formula: "Derived from target profit and operating expenses" } },
      { key: "over-under-cap", label: "(Over) / Under Cap", field: "overUnderCap", format: "currency", tooltip: { explanation: "Whether your management salary is within the cap", formula: "Salary Cap - Actual Management Salaries" } },
      {
        key: "labor-eff",
        label: "Labor Efficiency",
        field: "laborEfficiency",
        format: "pct",
        tooltip: { explanation: "What portion of gross profit goes to all wages", formula: "Total wages / Gross Profit" },
        interpretationId: "interp-labor-eff",
        interpretation: (enriched, financialInputs, brandName) => {
          const y1 = enriched[0];
          if (!y1 || y1.revenue === 0) return null;
          const labPct = y1.laborEfficiency * 100;
          const laborBrand = financialInputs?.operatingCosts?.laborPct?.brandDefault;
          if (laborBrand != null) {
            const brandPct = (laborBrand * 100).toFixed(0);
            return `${labPct.toFixed(0)}% of gross profit goes to wages (${brandName || "brand"} labor default: ${brandPct}% of revenue)`;
          }
          if (labPct > 70) return `${labPct.toFixed(0)}% of gross profit goes to wages — labor-heavy, consider staffing mix`;
          if (labPct > 50) return `${labPct.toFixed(0)}% of gross profit goes to wages — typical for service businesses`;
          return `${labPct.toFixed(0)}% of gross profit goes to wages — efficient labor cost structure`;
        },
      },
      { key: "adj-labor-eff", label: "Adjusted Labor Efficiency", field: "adjustedLaborEfficiency", format: "pct", tooltip: { explanation: "Labor efficiency excluding owner salary", formula: "Wages (excl. owner salary) / Gross Profit" } },
      { key: "disc-mktg-pct", label: "Discretionary Marketing %", field: "discretionaryMarketingPct", format: "pct", tooltip: { explanation: "Discretionary marketing as a share of revenue", formula: "Discretionary Marketing / Revenue" } },
      { key: "pr-tax-ben-pct", label: "PR Taxes & Benefits % of Wages", field: "prTaxBenefitsPctOfWages", format: "pct", tooltip: { explanation: "Payroll burden relative to total wages", formula: "Payroll Taxes & Benefits / Total Wages" } },
      { key: "other-opex-pct-rev", label: "Other OpEx % of Revenue", field: "otherOpexPctOfRevenue", format: "pct", tooltip: { explanation: "Miscellaneous operating costs as a share of revenue", formula: "Other Operating Expenses / Revenue" } },
    ],
  },
];

const PL_ANALYSIS_FIELDS = new Set([
  "adjustedPreTaxProfit", "targetPreTaxProfit", "aboveBelowTarget",
  "salaryCapAtTarget", "overUnderCap", "laborEfficiency",
  "adjustedLaborEfficiency", "discretionaryMarketingPct",
  "prTaxBenefitsPctOfWages", "otherOpexPctOfRevenue",
]);

function formatValue(value: number, format: "currency" | "pct", absDisplay?: boolean): string {
  const displayVal = absDisplay ? Math.abs(value) : value;
  if (format === "pct") return `${(displayVal * 100).toFixed(1)}%`;
  return formatCents(displayVal);
}

function getCellValue(
  field: string,
  col: ColumnDef,
  enriched: EnrichedAnnual[],
  monthly: MonthlyProjection[],
  plAnalysis: PLAnalysisOutput[],
  format: "currency" | "pct"
): number {
  if (field === "monthlyRevenue") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? ea.monthlyRevenue : 0;
    }
    if (col.level === "monthly" && col.month) {
      return getMonthlyValue("revenue", col.year, col.month, monthly);
    }
    if (col.level === "quarterly" && col.quarter) {
      const startMonth = (col.year - 1) * 12 + (col.quarter - 1) * 3;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < 3; i++) {
        const mp = monthly[startMonth + i];
        if (mp) {
          sum += mp.revenue;
          count++;
        }
      }
      return count > 0 ? Math.round(sum / count) : 0;
    }
    return 0;
  }

  if (field === "discretionaryMarketing") {
    if (col.level === "annual") {
      const ea = enriched[col.year - 1];
      return ea ? ea.discretionaryMarketing : 0;
    }
    if (col.level === "monthly" && col.month) {
      return getMonthlyValue("marketing", col.year, col.month, monthly);
    }
    if (col.level === "quarterly" && col.quarter) {
      return getQuarterlyValue("marketing", col.year, col.quarter, monthly, format);
    }
    return 0;
  }

  if (PL_ANALYSIS_FIELDS.has(field)) {
    return getAnnualValue(field, col.year, enriched, plAnalysis);
  }

  if (col.level === "annual") {
    return getAnnualValue(field, col.year, enriched, plAnalysis);
  }
  if (col.level === "quarterly" && col.quarter) {
    return getQuarterlyValue(field, col.year, col.quarter, monthly, format);
  }
  if (col.level === "monthly" && col.month) {
    return getMonthlyValue(field, col.year, col.month, monthly);
  }
  return 0;
}

function getEditableRowKeys(): string[] {
  const keys: string[] = [];
  for (const section of PNL_SECTIONS) {
    for (const row of section.rows) {
      if (isEditableRow(row.key)) {
        keys.push(row.key);
      }
    }
  }
  return keys;
}

const EDITABLE_ROW_ORDER = getEditableRowKeys();

export function PnlTab({ output, financialInputs, onCellEdit, isSaving, scenarioOutputs, brandName }: PnlTabProps) {
  const { annualSummaries, monthlyProjections, plAnalysis } = output;
  const enriched = useMemo(
    () => computeEnrichedAnnuals(monthlyProjections, annualSummaries),
    [monthlyProjections, annualSummaries]
  );

  const comparisonActive = !!scenarioOutputs;

  const scenarioEnriched = useMemo(() => {
    if (!scenarioOutputs) return null;
    return {
      base: computeEnrichedAnnuals(scenarioOutputs.base.monthlyProjections, scenarioOutputs.base.annualSummaries),
      conservative: computeEnrichedAnnuals(scenarioOutputs.conservative.monthlyProjections, scenarioOutputs.conservative.annualSummaries),
      optimistic: computeEnrichedAnnuals(scenarioOutputs.optimistic.monthlyProjections, scenarioOutputs.optimistic.annualSummaries),
    };
  }, [scenarioOutputs]);

  const {
    drillState,
    drillDown,
    drillUp,
    getColumns,
    expandAll,
    collapseAll,
    collapseMonthlyToQuarterly,
    hasMonthlyDrill,
    hasAnyDrillDown,
    getDrillLevel,
  } = useColumnManager();

  useEffect(() => {
    if (comparisonActive && hasMonthlyDrill) {
      collapseMonthlyToQuarterly();
    }
  }, [comparisonActive, hasMonthlyDrill, collapseMonthlyToQuarterly]);

  const columns = getColumns();
  const annualCols = columns.filter((c) => c.level === "annual");
  const visibleCols = hasAnyDrillDown ? columns : annualCols;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PNL_SECTIONS.forEach((s) => {
      initial[s.key] = s.defaultExpanded ?? true;
    });
    return initial;
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [flashingRows, setFlashingRows] = useState<Set<string>>(new Set());
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartEdit = useCallback((rowKey: string, colKey: string) => {
    if (isSaving || !onCellEdit || !financialInputs) return;
    if (!isEditableRow(rowKey)) return;
    setEditingCell(`${rowKey}:${colKey}`);
  }, [isSaving, onCellEdit, financialInputs]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleCommitEdit = useCallback((rowKey: string, rawInput: string) => {
    if (!onCellEdit || !financialInputs) return;
    const mapping = INPUT_FIELD_MAP[rowKey];
    if (!mapping) return;
    onCellEdit(mapping.category, mapping.fieldName, rawInput, mapping.inputFormat);
    setEditingCell(null);

    const flashKeys = new Set<string>();
    visibleCols.forEach((col) => {
      const cellKey = `${rowKey}:${col.key}`;
      if (cellKey !== editingCell) {
        flashKeys.add(cellKey);
      }
    });
    setFlashingRows(flashKeys);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashingRows(new Set());
    }, 250);
  }, [onCellEdit, financialInputs, editingCell, visibleCols]);

  const handleTabNav = useCallback((rowKey: string, direction: "next" | "prev") => {
    const idx = EDITABLE_ROW_ORDER.indexOf(rowKey);
    if (idx === -1) return;
    const nextIdx = direction === "next" ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < EDITABLE_ROW_ORDER.length) {
      const nextRowKey = EDITABLE_ROW_ORDER[nextIdx];
      const nextSection = PNL_SECTIONS.find((s) => s.rows.some((r) => r.key === nextRowKey));
      if (nextSection && !expandedSections[nextSection.key]) {
        setExpandedSections((prev) => ({ ...prev, [nextSection.key]: true }));
      }
      const firstCol = visibleCols[0];
      if (firstCol) {
        setEditingCell(`${nextRowKey}:${firstCol.key}`);
      }
    }
  }, [visibleCols, expandedSections]);

  const getRawValue = useCallback((rowKey: string): number => {
    if (!financialInputs) return 0;
    const mapping = INPUT_FIELD_MAP[rowKey];
    if (!mapping) return 0;
    const categoryObj = financialInputs[mapping.category as keyof PlanFinancialInputs];
    if (!categoryObj) return 0;
    const field = categoryObj[mapping.fieldName as keyof typeof categoryObj] as FinancialFieldValue;
    return field?.currentValue ?? 0;
  }, [financialInputs]);

  const canEdit = !!financialInputs && !!onCellEdit;

  const SCENARIOS: ScenarioId[] = ["base", "conservative", "optimistic"];

  const comparisonCols = useMemo(
    () => comparisonActive ? buildComparisonColumns(drillState) : [],
    [comparisonActive, drillState]
  );

  if (comparisonActive && scenarioOutputs && scenarioEnriched) {
    const totalScenarioCols = comparisonCols.length;
    return (
      <div className="space-y-0 pb-8" data-testid="pnl-tab">
        <PnlCalloutBar enriched={enriched} />
        <ColumnToolbar
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          hasAnyDrillDown={hasAnyDrillDown}
          showLinkedIndicator={canEdit}
          comparisonActive
        />
        <div className="overflow-x-auto" data-testid="pnl-table">
          <table className="w-full text-sm" role="grid" aria-label="Profit and Loss Statement — Scenario Comparison">
            <ComparisonTableHead drillState={drillState} testIdPrefix="pnl" />
            <tbody>
              {PNL_SECTIONS.map((section) => {
                const isExpanded = expandedSections[section.key] ?? true;
                return (
                  <ComparisonPnlSection
                    key={section.key}
                    section={section}
                    scenarioEnriched={scenarioEnriched}
                    scenarioOutputs={scenarioOutputs}
                    comparisonCols={comparisonCols}
                    isExpanded={isExpanded}
                    onToggle={() => toggleSection(section.key)}
                    totalCols={totalScenarioCols}
                    editingCell={editingCell}
                    flashingRows={flashingRows}
                    onStartEdit={canEdit ? handleStartEdit : undefined}
                    onCancelEdit={handleCancelEdit}
                    onCommitEdit={handleCommitEdit}
                    onTabNav={handleTabNav}
                    getRawValue={getRawValue}
                    financialInputs={financialInputs}
                    onCellEdit={onCellEdit}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-8" data-testid="pnl-tab">
      <PnlCalloutBar enriched={enriched} />
      <ColumnToolbar
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        hasAnyDrillDown={hasAnyDrillDown}
        showLinkedIndicator={canEdit}
      />
      <div className="overflow-x-auto" data-testid="pnl-table">
        <table className="w-full text-sm" role="grid" aria-label="Profit and Loss Statement">
          <GroupedTableHead
            columns={columns}
            getDrillLevel={getDrillLevel}
            onDrillDown={drillDown}
            onDrillUp={drillUp}
            hasAnyDrillDown={hasAnyDrillDown}
            testIdPrefix="pnl"
          />
          <tbody>
            {PNL_SECTIONS.map((section) => (
              <PnlSection
                key={section.key}
                section={section}
                columns={visibleCols}
                enriched={enriched}
                monthly={monthlyProjections}
                plAnalysis={plAnalysis}
                isExpanded={expandedSections[section.key] ?? true}
                onToggle={() => toggleSection(section.key)}
                editingCell={editingCell}
                flashingRows={flashingRows}
                onStartEdit={canEdit ? handleStartEdit : undefined}
                onCancelEdit={handleCancelEdit}
                onCommitEdit={handleCommitEdit}
                onTabNav={handleTabNav}
                getRawValue={getRawValue}
                showInterpretation={!hasAnyDrillDown}
                financialInputs={financialInputs}
                brandName={brandName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PnlCalloutBar({ enriched }: { enriched: EnrichedAnnual[] }) {
  const y1 = enriched[0];
  if (!y1) return null;
  const marginPct = (y1.preTaxIncomePct * 100).toFixed(1);
  return (
    <div
      className="px-4 py-3 border-b bg-muted/30 sticky top-0 z-30"
      data-testid="pnl-callout-bar"
    >
      <div className="flex flex-wrap items-center gap-4">
        <CalloutMetric
          label="Annual Revenue (Y1)"
          value={formatCents(y1.revenue)}
          testId="pnl-callout-revenue-y1"
        />
        <div className="w-px h-8 bg-border" />
        <CalloutMetric
          label="Pre-Tax Income (Y1)"
          value={formatCents(y1.preTaxIncome)}
          testId="pnl-callout-pretax-y1"
        />
        <div className="w-px h-8 bg-border" />
        <CalloutMetric
          label="Pre-Tax Margin %"
          value={`${marginPct}%`}
          testId="pnl-callout-margin-y1"
        />
      </div>
      <p
        className="text-xs text-muted-foreground mt-1.5"
        data-testid="pnl-callout-interpretation"
      >
        Year 1 pre-tax margin: {marginPct}%.{" "}
        {y1.preTaxIncome >= 0
          ? "Your business is projected to be profitable in Year 1."
          : "Your Year 1 projections show a net loss. Review revenue and expense assumptions."}
      </p>
    </div>
  );
}

function CalloutMetric({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-lg font-semibold font-mono tabular-nums" data-testid={testId}>{value}</span>
    </div>
  );
}

interface PnlSectionProps {
  section: PnlSectionDef;
  columns: ColumnDef[];
  enriched: EnrichedAnnual[];
  monthly: MonthlyProjection[];
  plAnalysis: PLAnalysisOutput[];
  isExpanded: boolean;
  onToggle: () => void;
  editingCell: string | null;
  flashingRows: Set<string>;
  onStartEdit?: (rowKey: string, colKey: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (rowKey: string, rawInput: string) => void;
  onTabNav: (rowKey: string, direction: "next" | "prev") => void;
  getRawValue: (rowKey: string) => number;
  showInterpretation?: boolean;
  financialInputs?: PlanFinancialInputs | null;
  brandName?: string;
}

function PnlSection({
  section, columns, enriched, monthly, plAnalysis, isExpanded, onToggle,
  editingCell, flashingRows, onStartEdit, onCancelEdit, onCommitEdit, onTabNav, getRawValue,
  showInterpretation = true, financialInputs, brandName,
}: PnlSectionProps) {
  return (
    <>
      <tr
        className="bg-muted/40 cursor-pointer hover-elevate"
        data-testid={`pnl-section-${section.key}`}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        role="row"
        aria-expanded={isExpanded}
      >
        <td
          className="py-2 px-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground sticky left-0 bg-muted/40 z-20"
          colSpan={columns.length + 1}
        >
          <span className="flex items-center gap-1">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
            {section.title}
          </span>
        </td>
      </tr>
      {isExpanded &&
        section.rows.map((row) => (
          <PnlRow
            key={row.key}
            row={row}
            columns={columns}
            enriched={enriched}
            monthly={monthly}
            plAnalysis={plAnalysis}
            editingCell={editingCell}
            flashingRows={flashingRows}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onCommitEdit={onCommitEdit}
            onTabNav={onTabNav}
            getRawValue={getRawValue}
            showInterpretation={showInterpretation}
            financialInputs={financialInputs}
            brandName={brandName}
          />
        ))}
    </>
  );
}

interface PnlRowProps {
  row: PnlRowDef;
  columns: ColumnDef[];
  enriched: EnrichedAnnual[];
  monthly: MonthlyProjection[];
  plAnalysis: PLAnalysisOutput[];
  editingCell: string | null;
  flashingRows: Set<string>;
  onStartEdit?: (rowKey: string, colKey: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (rowKey: string, rawInput: string) => void;
  onTabNav: (rowKey: string, direction: "next" | "prev") => void;
  getRawValue: (rowKey: string) => number;
  showInterpretation?: boolean;
  financialInputs?: PlanFinancialInputs | null;
  brandName?: string;
}

function PnlRow({
  row, columns, enriched, monthly, plAnalysis,
  editingCell, flashingRows, onStartEdit, onCancelEdit, onCommitEdit, onTabNav, getRawValue,
  showInterpretation = true, financialInputs, brandName,
}: PnlRowProps) {
  const rowClass = row.isTotal
    ? "font-semibold border-t-[3px] border-double border-b"
    : row.isSubtotal
      ? "font-medium border-t"
      : "";

  const paddingLeft = row.indent ? `${12 + row.indent * 16}px` : undefined;

  const inputCellClass = row.isInput
    ? "bg-primary/5 border-l-2 border-dashed border-primary/20"
    : "";

  const canEditThisRow = row.isInput && isEditableRow(row.key) && !!onStartEdit;
  const mapping = canEditThisRow ? INPUT_FIELD_MAP[row.key] : null;

  const interpText = showInterpretation && row.interpretation ? row.interpretation(enriched, financialInputs, brandName) : null;
  const interpId = row.interpretationId;

  return (
    <>
      <tr
        className={`${rowClass} hover-elevate group`}
        data-testid={`pnl-row-${row.key}`}
        role="row"
        aria-describedby={interpText && interpId ? interpId : undefined}
      >
        <td
          className={`py-1.5 px-3 text-sm sticky left-0 bg-background z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] ${inputCellClass}`}
          style={{ paddingLeft }}
          role="rowheader"
        >
          <span className="flex items-center gap-1.5">
            {row.label}
            {row.isInput && (
              <Pencil
                className="h-3 w-3 text-primary/40 invisible group-hover:visible shrink-0"
                aria-label="Editable field"
              />
            )}
          </span>
        </td>
        {columns.map((col) => {
          const value = getCellValue(row.field, col, enriched, monthly, plAnalysis, row.format);
          const isNegative = value < 0 && !row.isExpense;

          if (canEditThisRow && mapping) {
            const cellKey = `${row.key}:${col.key}`;
            const isEditingThis = editingCell === cellKey;
            const isFlashing = flashingRows.has(cellKey);
            const rawValue = getRawValue(row.key);

            const displayFormatted = formatFieldValue(rawValue, mapping.inputFormat);

            return (
              <InlineEditableCell
                key={col.key}
                displayValue={displayFormatted}
                rawValue={rawValue}
                inputFormat={mapping.inputFormat}
                isEditing={isEditingThis}
                onStartEdit={() => onStartEdit!(row.key, col.key)}
                onCancel={onCancelEdit}
                onCommit={(rawInput) => onCommitEdit(row.key, rawInput)}
                onTabNext={() => onTabNav(row.key, "next")}
                onTabPrev={() => onTabNav(row.key, "prev")}
                testId={`pnl-value-${row.key}-${col.key}`}
                ariaLabel={`${row.label}, ${col.label}`}
                className={`${inputCellClass}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
                isFlashing={isFlashing}
              />
            );
          }

          const cellContent = formatValue(value, row.format, row.isExpense);

          if (!row.isInput && row.tooltip) {
            return (
              <td
                key={col.key}
                className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
                data-testid={`pnl-value-${row.key}-${col.key}`}
                role="gridcell"
                aria-readonly="true"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{cellContent}</span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px]">
                    <p className="text-xs font-medium">{row.tooltip.explanation}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.tooltip.formula}</p>
                    <a
                      href="#glossary"
                      className="text-xs text-primary/50 mt-1 inline-block"
                      data-testid={`glossary-link-${row.key}`}
                      aria-disabled="true"
                      onClick={(e) => e.preventDefault()}
                    >
                      View in glossary
                    </a>
                  </TooltipContent>
                </Tooltip>
              </td>
            );
          }

          return (
            <td
              key={col.key}
              className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${row.isInput ? inputCellClass : ""}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}`}
              data-testid={`pnl-value-${row.key}-${col.key}`}
              role="gridcell"
              aria-readonly={row.isInput ? "false" : "true"}
            >
              {cellContent}
            </td>
          );
        })}
      </tr>
      {interpText && (
        <tr
          className="text-xs text-muted-foreground"
          data-testid={`pnl-interp-${row.key}`}
          id={interpId}
          role="row"
        >
          <td colSpan={columns.length + 1} className="py-1 px-3 pl-8 italic">
            {interpText}
          </td>
        </tr>
      )}
    </>
  );
}

function getScenarioAnnualValue(
  field: string,
  year: number,
  enriched: EnrichedAnnual[],
  plAnalysis: PLAnalysisOutput[],
): number {
  if (field === "monthlyRevenue") {
    const ea = enriched[year - 1];
    return ea ? ea.monthlyRevenue : 0;
  }
  if (field === "discretionaryMarketing") {
    const ea = enriched[year - 1];
    return ea ? ea.discretionaryMarketing : 0;
  }
  return getAnnualValue(field, year, enriched, plAnalysis);
}

function getComparisonCellValue(
  field: string,
  col: ComparisonColumnDef,
  enriched: EnrichedAnnual[],
  monthly: MonthlyProjection[],
  plAnalysis: PLAnalysisOutput[],
  format: "currency" | "pct",
): number {
  if (col.level === "annual") {
    return getScenarioAnnualValue(field, col.year, enriched, plAnalysis);
  }
  if (col.level === "quarterly" && col.quarter) {
    if (field === "monthlyRevenue") {
      const startMonth = (col.year - 1) * 12 + (col.quarter - 1) * 3;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < 3; i++) {
        const mp = monthly[startMonth + i];
        if (mp) { sum += mp.revenue; count++; }
      }
      return count > 0 ? Math.round(sum / count) : 0;
    }
    if (field === "discretionaryMarketing") {
      return getQuarterlyValue("marketing", col.year, col.quarter, monthly, format);
    }
    if (PL_ANALYSIS_FIELDS.has(field)) {
      return getAnnualValue(field, col.year, enriched, plAnalysis);
    }
    return getQuarterlyValue(field, col.year, col.quarter, monthly, format);
  }
  return 0;
}

interface ComparisonPnlSectionProps {
  section: PnlSectionDef;
  scenarioEnriched: Record<ScenarioId, EnrichedAnnual[]>;
  scenarioOutputs: ScenarioOutputs;
  comparisonCols: ComparisonColumnDef[];
  isExpanded: boolean;
  onToggle: () => void;
  totalCols: number;
  editingCell: string | null;
  flashingRows: Set<string>;
  onStartEdit?: (rowKey: string, colKey: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (rowKey: string, rawInput: string) => void;
  onTabNav: (rowKey: string, direction: "next" | "prev") => void;
  getRawValue: (rowKey: string) => number;
  financialInputs?: PlanFinancialInputs | null;
  onCellEdit?: (category: string, fieldName: string, rawInput: string, inputFormat: FormatType) => void;
}

function ComparisonPnlSection({
  section,
  scenarioEnriched,
  scenarioOutputs,
  comparisonCols,
  isExpanded,
  onToggle,
  totalCols,
  editingCell,
  flashingRows,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onTabNav,
  getRawValue,
  financialInputs,
  onCellEdit,
}: ComparisonPnlSectionProps) {
  return (
    <>
      <tr
        className="border-b bg-muted/30 cursor-pointer select-none"
        onClick={onToggle}
        data-testid={`pnl-section-${section.key}`}
        role="row"
      >
        <td
          className="py-2 px-3 font-medium text-sm sticky left-0 z-10 bg-muted/30 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]"
          data-testid={`pnl-section-label-${section.key}`}
        >
          <span className="flex items-center gap-1.5">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {section.title}
          </span>
        </td>
        <td colSpan={totalCols}>&nbsp;</td>
      </tr>
      {isExpanded &&
        section.rows.map((row) => (
          <ComparisonPnlRow
            key={row.key}
            row={row}
            scenarioEnriched={scenarioEnriched}
            scenarioOutputs={scenarioOutputs}
            comparisonCols={comparisonCols}
            editingCell={editingCell}
            flashingRows={flashingRows}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onCommitEdit={onCommitEdit}
            onTabNav={onTabNav}
            getRawValue={getRawValue}
            financialInputs={financialInputs}
            onCellEdit={onCellEdit}
          />
        ))}
    </>
  );
}

interface ComparisonPnlRowProps {
  row: PnlRowDef;
  scenarioEnriched: Record<ScenarioId, EnrichedAnnual[]>;
  scenarioOutputs: ScenarioOutputs;
  comparisonCols: ComparisonColumnDef[];
  editingCell: string | null;
  flashingRows: Set<string>;
  onStartEdit?: (rowKey: string, colKey: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (rowKey: string, rawInput: string) => void;
  onTabNav: (rowKey: string, direction: "next" | "prev") => void;
  getRawValue: (rowKey: string) => number;
  financialInputs?: PlanFinancialInputs | null;
  onCellEdit?: (category: string, fieldName: string, rawInput: string, inputFormat: FormatType) => void;
}

function ComparisonPnlRow({
  row,
  scenarioEnriched,
  scenarioOutputs,
  comparisonCols,
  editingCell,
  flashingRows,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onTabNav,
  getRawValue,
  financialInputs,
  onCellEdit,
}: ComparisonPnlRowProps) {
  const editable = isEditableRow(row.key) && !!onStartEdit;
  const mapping = editable ? INPUT_FIELD_MAP[row.key] : undefined;

  const labelCellClass =
    "py-1.5 px-3 text-sm whitespace-nowrap sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]";

  return (
    <tr
      className={`border-b${row.isTotal ? " font-semibold bg-muted/20" : ""}${row.isSubtotal ? " font-medium" : ""}`}
      data-testid={`pnl-row-${row.key}`}
      role="row"
    >
      <td
        className={`${labelCellClass}${row.isTotal ? " font-semibold bg-muted/20" : " bg-background"}${row.indent ? " pl-8" : ""}`}
        data-testid={`pnl-label-${row.key}`}
      >
        <span className="flex items-center gap-1.5">
          {row.label}
          {editable && !editingCell && (
            <Pencil className="h-3 w-3 text-muted-foreground/40" />
          )}
        </span>
      </td>
      {comparisonCols.map((col, colIdx) => {
        const scenario = col.scenario;
        const enriched = scenarioEnriched[scenario];
        const monthly = scenarioOutputs[scenario].monthlyProjections;
        const plAnalysis = scenarioOutputs[scenario].plAnalysis;
        const value = getComparisonCellValue(row.field, col, enriched, monthly, plAnalysis, row.format);
        const isNegative = value < 0;
        const cellContent = formatValue(value, row.format, row.isExpense);
        const isBase = scenario === "base";
        const isYearBoundary = colIdx > 0 && col.year !== comparisonCols[colIdx - 1].year;

        if (isBase && editable && editingCell === `${row.key}:${col.key}`) {
          const rawValue = getRawValue(row.key);
          return (
            <td
              key={col.key}
              className={`py-1.5 px-1 text-right ${SCENARIO_COLORS[scenario].bg}${isYearBoundary ? " border-l-2 border-border/40" : ""}`}
              role="gridcell"
              data-testid={`pnl-value-${row.key}-${col.key}`}
            >
              <InlineEditableCell
                value={formatFieldValue(rawValue, mapping!.inputFormat)}
                inputFormat={mapping!.inputFormat}
                onCommit={(val) => onCommitEdit(row.key, val)}
                onCancel={onCancelEdit}
                onTabNext={() => onTabNav(row.key, "next")}
                onTabPrev={() => onTabNav(row.key, "prev")}
                testId={`pnl-value-${row.key}-${col.key}`}
                ariaLabel={`${row.label}, ${col.label}`}
                className={isNegative ? "text-amber-700 dark:text-amber-400" : ""}
                isFlashing={false}
              />
            </td>
          );
        }

        const canClickEdit = isBase && editable && !editingCell;

        return (
          <td
            key={col.key}
            className={`py-1.5 px-3 text-right font-mono tabular-nums text-sm whitespace-nowrap ${SCENARIO_COLORS[scenario].bg}${isNegative ? " text-amber-700 dark:text-amber-400" : ""}${isYearBoundary ? " border-l-2 border-border/40" : ""}${canClickEdit ? " cursor-pointer" : ""}`}
            data-testid={`pnl-value-${row.key}-${col.key}`}
            role="gridcell"
            onClick={canClickEdit ? () => onStartEdit!(row.key, col.key) : undefined}
          >
            {cellContent}
          </td>
        );
      })}
    </tr>
  );
}
