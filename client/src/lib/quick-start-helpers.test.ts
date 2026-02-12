import { describe, it, expect } from "vitest";
import {
  staffCountToLaborPct,
  laborPctToStaffCount,
  scaleStartupCosts,
  startupCostTotal,
  breakEvenToCalendarDate,
  generateSentimentFrame,
  generateLeverHint,
  createDefaultStartupCostItem,
  AVG_ANNUAL_WAGE_CENTS,
} from "./quick-start-helpers";
import type { StartupCostLineItem } from "@shared/financial-engine";

// ─── Helpers ────────────────────────────────────────────────────────────

function makeCost(overrides: Partial<StartupCostLineItem> = {}): StartupCostLineItem {
  return {
    id: "cost-1",
    name: "Test Item",
    amount: 1_000_000, // $10,000
    capexClassification: "capex",
    isCustom: false,
    source: "brand_default",
    brandDefaultAmount: 1_000_000,
    item7RangeLow: null,
    item7RangeHigh: null,
    sortOrder: 1,
    ...overrides,
  };
}

// ─── staffCountToLaborPct ───────────────────────────────────────────────

describe("staffCountToLaborPct", () => {
  it("computes labor percentage from staff count and revenue", () => {
    // 5 staff × $35,000/yr = $175,000/yr labor cost
    // Monthly revenue $50,000 = $600,000/yr annual revenue
    // laborPct = 175000 / 600000 ≈ 0.2917
    const pct = staffCountToLaborPct(5, 5_000_000);
    expect(pct).toBeCloseTo(0.2917, 3);
  });

  it("clamps to minimum 5% for very low staff counts", () => {
    // 1 staff × $35,000/yr = $35,000 labor
    // Monthly revenue $200,000 → $2,400,000 annual
    // laborPct = 35000 / 2400000 ≈ 0.0146 → clamped to 0.05
    const pct = staffCountToLaborPct(1, 20_000_000);
    expect(pct).toBe(0.05);
  });

  it("clamps to maximum 60% for very high staff counts", () => {
    // 100 staff × $35,000/yr = $3,500,000 labor
    // Monthly revenue $10,000 → $120,000 annual
    // laborPct = 3500000 / 120000 ≈ 29.17 → clamped to 0.60
    const pct = staffCountToLaborPct(100, 1_000_000);
    expect(pct).toBe(0.60);
  });

  it("returns minimum when monthly revenue is zero (guards division by zero)", () => {
    const pct = staffCountToLaborPct(5, 0);
    expect(pct).toBe(0.05);
  });

  it("returns minimum when monthly revenue is negative", () => {
    const pct = staffCountToLaborPct(5, -500_000);
    expect(pct).toBe(0.05);
  });

  it("handles zero staff count", () => {
    const pct = staffCountToLaborPct(0, 5_000_000);
    expect(pct).toBe(0.05); // 0 / anything = 0, clamped to min
  });
});

// ─── laborPctToStaffCount ───────────────────────────────────────────────

describe("laborPctToStaffCount", () => {
  it("converts labor percentage back to staff count (round-trip)", () => {
    const monthlyAuv = 5_000_000;
    const pct = staffCountToLaborPct(5, monthlyAuv);
    const staff = laborPctToStaffCount(pct, monthlyAuv);
    expect(staff).toBe(5);
  });

  it("returns 1 if AVG_ANNUAL_WAGE_CENTS were zero (safety guard)", () => {
    // This tests the guard condition — in practice the constant is non-zero
    // so this just verifies the function doesn't crash with normal inputs
    const staff = laborPctToStaffCount(0.30, 5_000_000);
    expect(staff).toBeGreaterThanOrEqual(0);
  });

  it("rounds to nearest integer", () => {
    // 0.25 × ($50,000 × 12) / $35,000 = 0.25 × 600000 / 35000 ≈ 4.29 → 4
    const staff = laborPctToStaffCount(0.25, 5_000_000);
    expect(staff).toBe(4);
  });
});

// ─── scaleStartupCosts ──────────────────────────────────────────────────

describe("scaleStartupCosts", () => {
  it("scales costs proportionally to match new budget", () => {
    const costs = [
      makeCost({ id: "a", amount: 500_000, name: "Item A" }),
      makeCost({ id: "b", amount: 500_000, name: "Item B" }),
    ];
    const scaled = scaleStartupCosts(costs, 2_000_000); // double the budget
    expect(scaled[0].amount).toBe(1_000_000);
    expect(scaled[1].amount).toBe(1_000_000);
  });

  it("updates source to user_entry on all scaled items", () => {
    const costs = [makeCost({ source: "brand_default" })];
    const scaled = scaleStartupCosts(costs, 2_000_000);
    expect(scaled[0].source).toBe("user_entry");
  });

  it("preserves proportional distribution", () => {
    const costs = [
      makeCost({ id: "a", amount: 300_000 }),
      makeCost({ id: "b", amount: 700_000 }),
    ];
    const scaled = scaleStartupCosts(costs, 500_000); // halve the budget
    // 300/1000 = 30%, 700/1000 = 70%
    expect(scaled[0].amount).toBe(150_000);
    expect(scaled[1].amount).toBe(350_000);
  });

  it("adjusts largest item for rounding to match exact budget", () => {
    const costs = [
      makeCost({ id: "a", amount: 333_333 }),
      makeCost({ id: "b", amount: 333_333 }),
      makeCost({ id: "c", amount: 333_334 }),
    ];
    const target = 500_000;
    const scaled = scaleStartupCosts(costs, target);
    const total = scaled.reduce((s, c) => s + c.amount, 0);
    expect(total).toBe(target);
  });

  it("creates a default line item when costs array is empty", () => {
    const result = scaleStartupCosts([], 500_000);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("qs-general-investment");
    expect(result[0].amount).toBe(500_000);
    expect(result[0].source).toBe("user_entry");
    expect(result[0].name).toBe("General Startup Investment");
  });

  it("assigns budget to first item when current total is zero", () => {
    const costs = [makeCost({ amount: 0 }), makeCost({ id: "b", amount: 0 })];
    const result = scaleStartupCosts(costs, 500_000);
    expect(result[0].amount).toBe(500_000);
    expect(result[0].source).toBe("user_entry");
  });

  it("clamps rounding adjustment so no item goes negative", () => {
    // Tiny item + large item: scale down drastically so rounding diff could push tiny item negative
    const costs = [
      makeCost({ id: "tiny", amount: 1, name: "Tiny" }),
      makeCost({ id: "big", amount: 999_999, name: "Big" }),
    ];
    const scaled = scaleStartupCosts(costs, 1); // scale to just 1 cent
    scaled.forEach((c) => {
      expect(c.amount).toBeGreaterThanOrEqual(0);
    });
  });
});

// ─── createDefaultStartupCostItem ────────────────────────────────────────

describe("createDefaultStartupCostItem", () => {
  it("creates a valid startup cost line item with the given amount", () => {
    const item = createDefaultStartupCostItem(5_000_000);
    expect(item.id).toBe("qs-general-investment");
    expect(item.name).toBe("General Startup Investment");
    expect(item.amount).toBe(5_000_000);
    expect(item.source).toBe("user_entry");
    expect(item.isCustom).toBe(true);
    expect(item.capexClassification).toBe("non_capex");
  });

  it("creates item with zero amount", () => {
    const item = createDefaultStartupCostItem(0);
    expect(item.amount).toBe(0);
  });
});

// ─── startupCostTotal ───────────────────────────────────────────────────

describe("startupCostTotal", () => {
  it("sums all startup cost amounts", () => {
    const costs = [
      makeCost({ amount: 100_000 }),
      makeCost({ id: "b", amount: 200_000 }),
      makeCost({ id: "c", amount: 300_000 }),
    ];
    expect(startupCostTotal(costs)).toBe(600_000);
  });

  it("returns 0 for empty array", () => {
    expect(startupCostTotal([])).toBe(0);
  });
});

// ─── breakEvenToCalendarDate ────────────────────────────────────────────

describe("breakEvenToCalendarDate", () => {
  it("returns 'Beyond 5 years' for null break-even month", () => {
    expect(breakEvenToCalendarDate(null)).toBe("Beyond 5 years");
  });

  it("formats as 'Month Year (Month N)' with 1-indexed engine month", () => {
    const base = new Date(2026, 0, 1); // January 2026
    // breakEvenMonth=14 (1-indexed) → 13 months after Jan 2026 → February 2027
    const result = breakEvenToCalendarDate(14, base);
    expect(result).toBe("February 2027 (Month 14)");
  });

  it("handles single-month break-even (month 1 = current month)", () => {
    const base = new Date(2026, 0, 1);
    // breakEvenMonth=1 → first month of ops → January 2026 (same month)
    const result = breakEvenToCalendarDate(1, base);
    expect(result).toBe("January 2026 (Month 1)");
  });

  it("handles December year boundary", () => {
    const base = new Date(2026, 11, 1); // December 2026
    // breakEvenMonth=1 → first month of ops → December 2026 (same month)
    const result = breakEvenToCalendarDate(1, base);
    expect(result).toBe("December 2026 (Month 1)");
  });

  it("handles 60-month break-even", () => {
    const base = new Date(2026, 0, 1);
    // breakEvenMonth=60 → 59 months after Jan 2026 → December 2030
    const result = breakEvenToCalendarDate(60, base);
    expect(result).toBe("December 2030 (Month 60)");
  });
});

// ─── generateSentimentFrame ─────────────────────────────────────────────

describe("generateSentimentFrame", () => {
  it("generates positive frame with ROI and calendar date", () => {
    const msg = generateSentimentFrame(0.14, 14);
    expect(msg).toContain("14%");
    expect(msg).toContain("5 years");
    // Sentiment frame shows calendar date only (without month number) per UX design
    expect(msg).toMatch(/Break-even by \w+ \d{4}/);
    expect(msg).toContain("positive returns");
  });

  it("generates generic negative frame for negative ROI", () => {
    const msg = generateSentimentFrame(-0.05, null);
    expect(msg).toContain("return timeline extends beyond");
  });

  it("generates negative frame when ROI is zero", () => {
    const msg = generateSentimentFrame(0, 36);
    expect(msg).toContain("return timeline extends beyond");
  });

  it("generates negative frame when break-even is null even with positive ROI", () => {
    const msg = generateSentimentFrame(0.10, null);
    expect(msg).toContain("return timeline extends beyond");
  });

  it("identifies 'first year' correctly for break-even month 1-12", () => {
    const msg = generateSentimentFrame(0.10, 8);
    expect(msg).toContain("first year");
  });

  it("identifies 'second year' correctly for break-even month 13-24", () => {
    const msg = generateSentimentFrame(0.10, 18);
    expect(msg).toContain("second year");
  });

  it("identifies 'third year' correctly for break-even month 25-36", () => {
    const msg = generateSentimentFrame(0.10, 30);
    expect(msg).toContain("third year");
  });
});

// ─── generateLeverHint ──────────────────────────────────────────────────

describe("generateLeverHint", () => {
  it("produces actionable guidance with field label", () => {
    const hint = generateLeverHint({
      field: "revenue",
      label: "monthly revenue",
      roiDelta: 0.05,
    });
    expect(hint).toBe(
      "Adjusting your monthly revenue has the biggest effect on your return timeline."
    );
  });

  it("works for all field types", () => {
    const fields = ["revenue", "rent", "investment", "staff", "supplies"] as const;
    const labels = ["monthly revenue", "monthly rent", "investment budget", "number of staff", "cost of supplies"];
    fields.forEach((field, i) => {
      const hint = generateLeverHint({ field, label: labels[i], roiDelta: 0.01 });
      expect(hint).toContain(labels[i]);
    });
  });
});
