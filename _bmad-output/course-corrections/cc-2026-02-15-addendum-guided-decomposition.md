# Course Correction Addendum: Guided Journey Field Decomposition & Help Content System

**Date:** 2026-02-15
**Parent Document:** cc-2026-02-15-financial-output-layer.md
**Purpose:** Analyze which spreadsheet fields need decomposition for guided journeys, and catalog all embedded help content (Loom videos, comments, glossary) for integration into the application's guidance system

---

## 1. The Two-Layer Input Model

The spreadsheet represents the **expert-level view** — a seasoned operator (Jordan persona) who already thinks in financial statement structure. For the guided journey (Sam/Planning Assistant persona), some lumped fields need to be **decomposed into their component parts** and walked through with context.

**Design principle:** The engine always operates on the spreadsheet's consolidated fields. The UI layer handles decomposition (breaking apart for guided journeys) and recomposition (rolling up into engine inputs). Quick Entry / expert mode shows the spreadsheet-level fields directly. Forms / guided mode shows decomposed sub-fields.

---

## 2. Field Decomposition Analysis

### 2.1 Fields That NEED Decomposition for Guided Journeys

These are spreadsheet fields where a first-time franchisee won't know the answer without being walked through component parts:

#### A. Facilities ($) → rent, utilities, telecom/IT, vehicle fleet

**Spreadsheet field:** `Facilities ($)` — single dollar amount per year
**Spreadsheet comment:** "Facilities should include rent, utilities, telecommunications, IT costs, and vehicle fleet."
**Loom video:** https://www.loom.com/share/56ad5880cda64717ae59b351afa733b9

**Current UI implementation:** Already decomposed into `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` — good instinct, but the sub-fields don't match the comment's decomposition and "insurance" isn't mentioned.

**Recommended guided decomposition:**

| Sub-field | Unit | Notes |
|-----------|------|-------|
| Rent / Lease | $/month | Largest component, typically from lease agreement |
| Utilities | $/month | Electric, gas, water, sewer |
| Telecommunications & IT | $/month | Phone, internet, POS system, software subscriptions |
| Vehicle Fleet | $/month | If applicable — many franchise types don't have vehicles |
| Insurance | $/month | Property, liability, workers comp (not in spreadsheet comment but real cost) |

**Engine mapping:** Sum all sub-fields → `facilitiesAnnual[year]` (× 12 for annual)
**Expert mode:** Shows single "Facilities ($)" per year, matching spreadsheet
**Forms mode:** Walks through each sub-field with explanations

#### B. Total Investment Required → startup cost line items

**Spreadsheet field:** `Total investment required` — single number
**Spreadsheet sub-fields:** `CapEx investments`, `Non-CapEx investments`, `Working Capital / Additional Funds`
**Loom video:** https://www.loom.com/share/f99eea6aea6c4fa69a8f628dff89b7af

**Current implementation:** Already decomposed via the Startup Cost Builder (Epic 2) with individual line items classified as capex/non_capex/working_capital. This is the strongest example of guided decomposition already working correctly.

**Status:** ✅ Already correct. Startup costs serve this purpose well.

#### C. Equity / Cash Injection + Debt → financing structure

**Spreadsheet fields:** `Equity / Cash Injection`, `Debt`, `Debt Term (Months)`, `Debt Interest Rate`
**Spreadsheet comment on financing:** "In Financing, additional equity / cash injection can be added post start of operations" and "SBA Loans are typically 10 years (120 months) at around 10-10.5%"
**Loom video:** https://www.loom.com/share/867db553358644df8c31c4447d971180

**Guided decomposition needed:**

| Sub-field | Unit | Guidance Needed |
|-----------|------|----------------|
| Personal savings / cash available | $ | "How much of your own money are you planning to invest?" |
| Additional investor equity | $ | "Will anyone else be investing alongside you?" |
| SBA loan amount | $ | "Are you planning to use an SBA loan? Typical terms are 10 years at 10-10.5%" |
| Other loan amount | $ | "Any other financing sources (HELOC, family loans, etc.)?" |
| Loan term | months | Pre-filled with SBA typical: 120 months |
| Interest rate | % | Pre-filled with SBA typical: 10.5% |

**Engine mapping:** Sum equity sources → equity injection. Sum loan sources → debt. Check: equity + debt ≥ total investment.
**Expert mode:** Shows spreadsheet's 4 fields directly
**Forms mode:** Walks through financing sources with SBA guidance

#### D. Management & Admin Salaries ($) → role-based compensation

**Spreadsheet field:** `Management & Admin Salaries ($)` — single dollar amount per year
**Spreadsheet comment:** "This field would include 'gross wages' of non-direct employees. We define non-direct as anyone who spends less than 50% of their time working on revenue producing activities."
**Loom video:** https://www.loom.com/share/b22de84d079b4167afdfc92c54d12982

**Guided decomposition:**

| Sub-field | Unit | Guidance |
|-----------|------|----------|
| Owner/operator salary | $/year | "What salary will you pay yourself? (Related to Shareholder Salary Adjustment)" |
| General manager salary | $/year | "If you're hiring a GM, what's their expected salary?" |
| Admin/office staff | $/year | "Any admin, bookkeeping, or office staff not directly producing revenue?" |

**Engine mapping:** Sum all → `managementSalariesAnnual[year]`
**Expert mode:** Shows single "Mgmt & Admin Salaries" per year
**Forms mode:** Walks through expected roles

#### E. Shareholder Salary Adjustment → guided explanation of sweat equity

**Spreadsheet field:** `Shareholder salary adjustment (+=underpayed)` — per year
**Spreadsheet comment:** "Sometimes a business owner will decide to perform a job within the business that should pay a certain salary per year, but they go without pay instead in order to preserve capital (sweat equity). This is the same as putting that amount into the business as an investor..."
**Loom video:** https://www.loom.com/share/f2eed8e7f63348098282963116a02539

**Not decomposition but guided explanation needed.** This concept is confusing for first-time franchisees. The guided journey should:
1. Ask: "Will you be working in the business yourself?"
2. If yes: "What role will you perform?" (links to Mgmt & Admin roles above)
3. "What would you hire someone to do that job for?" → that's the market rate
4. "What salary will you actually take?" → the difference is the adjustment
5. If Year 1 salary is $0 but market rate is $55K, adjustment = $55,000

**Engine mapping:** Direct → `shareholderSalaryAdj[year]` (new engine input)
**Expert mode:** Shows the raw adjustment number per year
**Forms mode:** Multi-step guided flow explaining sweat equity concept

#### F. Direct Labor Cost (% of Revenue) → staffing plan

**Spreadsheet field:** `Direct Labor Cost (% of Revenue)` — percentage per year
**Spreadsheet comment:** "This field would include 'gross wages' of direct employees as a percentage of gross revenues. We define direct as anyone who spends more than 50% of their time working on revenue producing activities."
**Loom video:** https://www.loom.com/share/5b51d205a4144b1cb09f2e02c628c529

**Potential guided decomposition:**

| Sub-field | Unit | Guidance |
|-----------|------|----------|
| Number of full-time employees | count | "How many full-time employees producing revenue?" |
| Average hourly wage | $/hour | "What's the typical hourly rate for this role?" |
| Average hours/week | hours | "How many hours per week does each work?" |
| Number of part-time employees | count | Optional |
| Part-time avg hours/week | hours | Optional |

**Engine mapping:** Calculate total labor cost → divide by projected revenue → `laborPct[year]`
**Expert mode:** Shows the percentage directly
**Forms mode:** Walks through staffing plan, computes the percentage
**Note:** This is a "nice-to-have" decomposition — many franchisees already know their labor % from FDD. Could be offered as an optional calculator.

#### G. Distributions → guided explanation

**Spreadsheet field:** `Estimated Distributions from the Company` — per year
**Spreadsheet comment:** "From the franchise business"
**Glossary definition:** "Amounts of money taken out of the business by the owners or partners. After the business earns money and pays its bills, the leftover profits can either be kept in the business or distributed to the owners."
**Loom video:** https://www.loom.com/share/f643dd1e41264cf7a6029d826c7c069e

**Not decomposition but context:** Guided journey should explain that distributions affect cash flow and ROIC, and that taking distributions too early can deplete core capital. The guided flow should show the impact: "If you take $30,000 in Year 4, here's how that affects your cash position."

### 2.2 Fields That Do NOT Need Decomposition

These fields are already atomic in the spreadsheet and map directly to the engine:

| Field | Why No Decomposition Needed |
|-------|---------------------------|
| AUV / Gross Sales | Single number from FDD Item 19 |
| Time to Reach AUV | Single number, franchisee estimates |
| Starting Month AUV % | Single percentage |
| Corporation Tax | Standard rate (21% federal) |
| EBITDA Multiple | Single industry metric |
| Annual Growth Rate | Single % per year |
| Royalty Fee | From franchise agreement (fixed) |
| Ad Fund / Marketing Fee | From franchise agreement (fixed) |
| Materials COGS | Standard % from FDD |
| Marketing | Single % per year |
| Payroll Taxes & Benefits | Standard % (typically 20%) |
| Other Operating Expenses | Catchall % per year |
| Target Pre-tax Profit | Target % (industry standard 15%) |
| Debt Term / Interest Rate | Standard loan terms |
| AR Days / AP Days / Inventory Days | Standard accounting assumptions |
| Depreciation Rate | Standard rate |

### 2.3 Fields Where the Current UI Has Wrong Decomposition

| Current UI Field | Problem | Fix |
|-----------------|---------|-----|
| `rentMonthly` | Spreadsheet uses "Facilities" which includes rent + utilities + telecom + vehicles | Rename sub-field group. Insurance isn't in spreadsheet's Facilities definition |
| `utilitiesMonthly` | Part of Facilities — correct sub-field | Keep, but label as Facilities sub-component |
| `insuranceMonthly` | NOT part of spreadsheet's "Facilities" — insurance is typically in "Other OpEx" | Move to Other OpEx decomposition or keep as separate guided field |
| `otherMonthly` (flat $) | Spreadsheet uses "Other Operating Expenses (% of Revenue)" — percentage, not dollar | Change to % of revenue to match spreadsheet |
| `downPaymentPct` | Spreadsheet has absolute `Equity / Cash Injection` dollar amount, not a % | Change to dollar amount in guided flow |

---

## 3. Help Content System — Embedded Guidance Inventory

The spreadsheets contain a rich help content system that should be replicated in the application:

### 3.1 Loom Video Links (24 total)

Every major input field and output section has an associated Loom video walkthrough. These are the "Explanation" hyperlinks in column C of Input Assumptions and scattered across output sheets.

**Input Assumptions videos (19):**

| Field | Loom URL |
|-------|----------|
| Overall Introduction | https://www.loom.com/share/44b07e263f6d41cf95ca8b439e5ea7f9 |
| Start of Business Operations | https://www.loom.com/share/6f6062eee0ad4efb816c835aa8bab046 |
| Gross Sales / AUV | https://www.loom.com/share/72c933ae985340ac8c486c8bd334b4a3 |
| Time to Reach AUV | https://www.loom.com/share/effebce43de94ecd9a28cf59f7db72c5 |
| Starting Month AUV % | https://www.loom.com/share/dc706d587ed24734a8c830fd7eec1bd2 |
| Corporation Tax | https://www.loom.com/share/9048ebc4cf4948fc9464628c4a8c5660 |
| EBITDA Multiple | https://www.loom.com/share/bfbbe58a534a4df383dd201eae8d6ca4 |
| Annual Growth Rate | https://www.loom.com/share/2ba3805fb19442cd8f4a191c5537da07 |
| Franchise Fees (Royalty) | https://www.loom.com/share/32f4599ae9574be5877a41773f7f2dc7 |
| Materials COGS | https://www.loom.com/share/d84fe9b1ba0e472680571dd09df9746b |
| Direct Labor Cost | https://www.loom.com/share/5b51d205a4144b1cb09f2e02c628c529 |
| Facilities | https://www.loom.com/share/56ad5880cda64717ae59b351afa733b9 |
| Marketing | https://www.loom.com/share/bbd2aa97ddb24f68b2c0608002224fce |
| Management & Admin Salaries | https://www.loom.com/share/b22de84d079b4167afdfc92c54d12982 |
| Payroll Taxes & Benefits | https://www.loom.com/share/c84353c830c9435d94ccaaf3daf7afdf |
| Other Operating Expenses | https://www.loom.com/share/d749251844d3443c9f3cb3bf5afe5cad |
| Shareholder Salary Adjustment | https://www.loom.com/share/f2eed8e7f63348098282963116a02539 |
| Total Investment Spending | https://www.loom.com/share/f99eea6aea6c4fa69a8f628dff89b7af |
| Financing (Equity/Debt) | https://www.loom.com/share/867db553358644df8c31c4447d971180 |
| Distributions | https://www.loom.com/share/f643dd1e41264cf7a6029d826c7c069e |

**Output Section videos (5):**

| Section | Loom URL |
|---------|----------|
| Net Profit Before Tax (Summary) | https://www.loom.com/share/a38dbeb6fa4f463ebc91a3180cf588f1 |
| Labor Efficiency (Summary) | https://www.loom.com/share/ecd3c7e4ecc34e669199a79af486838f |
| Breakeven Analysis | https://www.loom.com/share/d90d5507c8fd438488337e2b10213945 |
| Payback Period Analysis | https://www.loom.com/share/b7b15b4a670447298ddba721eb1cd071 |
| Returns on Invested Capital | https://www.loom.com/share/9cfebc103a914c4c95a2c0e694ab1610 |
| Valuation | https://www.loom.com/share/87ba3a6ee9b541d4be4d8edf40946733 |

**Introduction video (1):**

| Context | Loom URL |
|---------|----------|
| "Start Here!" overall intro | https://www.loom.com/share/a3e62906065740968310777238a8d74b |

### 3.2 Cell Comments (33-34 per spreadsheet)

Every editable input field has a threaded comment explaining what to enter and why. These are the inline help tooltips. Key comments extracted:

**Revenue & Growth:**
- "The number of months it will take to reach 'Average Unit Volume' (AUV), otherwise known as average Gross Sales or Revenue, from the start of business operations date."
- "Input the estimated % of monthly AUV that the business is expected to achieve in the first month."
- "Please be aware that the Time to Reach AUV (months) takes precedence over the annual growth rate input. The annual growth rate until the AUV is reached will be determined by the Time to Reach AUV input. After the AUV is reached, then the Annual Growth Rate will be used."

**Operating Expenses:**
- Direct Labor: "This field would include 'gross wages' of direct employees as a percentage of gross revenues. We define direct as anyone who spends more than 50% of their time working on revenue producing activities. We do not recommend adding payroll taxes and benefits to this number since it clouds the simple decision making that can come from the Direct LER."
- Facilities: "Facilities should include rent, utilities, telecommunications, IT costs, and vehicle fleet."
- Marketing: "Advertising, marketing materials, marketing consultants, ad words, meals & entertainment. Your target total marketing spend (including the marketing fee / ad fund) as a percentage of gross sales should be 6-10%."
- Mgmt & Admin: "This field would include 'gross wages' of non-direct employees. We define non-direct as anyone who spends less than 50% of their time working on revenue producing activities. We do not recommend adding payroll taxes and benefits to this number since it clouds the simple decision making that can come from the Management LER."
- Payroll Tax: "Payroll taxes, health and other insurances, retirement benefits and other ancillary benefits."
- Other OpEx: "Other operating expenses - catchall bucket for everything else"

**Investment & Financing:**
- Total Investment: "Total investment required for a franchise unit"
- CapEx: "Investment into fixed assets that are subject to depreciation (CapEx)"
- Non-CapEx: "Other investments that do not have a tangible asset value"
- Working Capital: "Additional Funds, Funds / Cash available in the business"
- Check: "CapEx investments + Non-CapEx investments + Working Capital / Additional Funds should equal Total investment required"
- Equity: "Additional equity / cash injection can be added post start of operations"
- Debt: "SBA Loans are typically 10 years (120 months) at around 10-10.5%"
- Financing Check: "Total Financing should be more than Total Investment required"

**P&L Analysis:**
- Shareholder Salary Adj: "Sometimes a business owner will decide to perform a job within the business that should pay a certain salary per year, but they go without pay instead in order to preserve capital (sweat equity)..."

**Balance Sheet:**
- Retained Earnings: "Retained Earnings is after tax and after distributions"
- Core Capital: "As a general rule of thumb, your core capital target is equal to two months of operating expenses and labor expenses in cash and nothing drawn on a line of credit."

**Valuation:**
- Replacement Return: "When you consider selling a business, use replacement return to gain economic clarity. A straight forward economic green light occurs only when the replacement return is anywhere below 15%..."
- ROIC: "When you start a business or reinvest for growth, use ROIC for decision making."

### 3.3 Glossary Content (15 terms with definitions + benchmarks)

| Term | Definition (abbreviated) | Benchmark |
|------|------------------------|-----------|
| Payback Period | Time for investment to generate amount equal to initial cost | 4-7 years |
| EBITDA | Earnings before interest, taxes, depreciation, amortization | 10-20% of gross revenues |
| Adj Net Profit Before Tax | Net Profit adjusted for owner salary shortfall | 10-15% of gross revenues |
| Shareholder Salary Adjustment | Amount owner is "underpaid" — sweat equity concept | Specific to each investor |
| EBITDA Multiple | How much people pay for a business relative to EBITDA | 4x-7x depending on franchise |
| Average Unit Volume (AUV) | Average sales per franchise unit per year | See Input Assumptions |
| Direct Labor Cost | Gross wages of employees spending >50% time on revenue activities | Generally 25-30% of Gross Sales |
| Facilities | Rent, utilities, telecom, IT, vehicle fleet | Unit specific |
| Equity - Cash | Outside equity invested into the business | Typically 25% of total cost |
| Core Capital | Monthly opex + labor in cash, nothing on LOC | Unit specific |
| Estimated Distributions | Money taken out by owners after bills paid | Depends on post-tax profitability |
| ROIC | Return on invested capital — gain/loss as % of initial cost | Target 40%+ with 10%+ adj profitability |
| Breakeven | Point where costs and income are equal | N/A |
| Number of Months to Breakeven | Months from open to breakeven | 6-18 months |
| Cash Flow | Money coming into and going out of the business | N/A |

---

## 4. Proposed Help Content Architecture

### 4.1 Glossary as Main Menu Feature

**Proposal:** Glossary becomes a navigable page in the main sidebar menu, available to all franchisees regardless of planning mode. This replaces the spreadsheet's Glossary tab.

**Content structure per term:**
- Term name
- Plain-language definition (from glossary)
- How it's calculated (from engine logic)
- Industry benchmark (from glossary "Benchmark" column)
- Loom video link (where one exists)
- "See it in your plan" link → navigates to the relevant financial statement section

**Implementation:** Store glossary content as brand-configurable data (benchmarks may vary by industry/brand). Franchisors can customize benchmark values. Definitions remain standard across brands.

### 4.2 Contextual Help Tooltips

**Proposal:** Every input field in Forms and Quick Entry shows an info icon that expands to show:
1. The cell comment text from the spreadsheet (brief explanation)
2. A "Watch video" link to the Loom video (if one exists)
3. A "Learn more" link to the Glossary entry (if one exists)

This replicates the spreadsheet's comment-on-hover experience but with richer content.

### 4.3 Video Links as Brand-Configurable Content

**Current state:** All 4 spreadsheets share identical Loom video links — these are Vetted Biz (Katalyst's predecessor/partner) content, not brand-specific.

**Proposal:** Store video URLs as platform-level help content (not per-brand). Allow Katalyst admins to update video URLs as new content is produced. Structure:

```
HelpContent {
  fieldKey: string          // e.g., "input.facilities", "output.roic"
  tooltipText: string       // Brief explanation (from spreadsheet comments)
  videoUrl: string | null   // Loom or other video link
  glossaryTermSlug: string | null  // Links to glossary entry
}
```

### 4.4 "Start Here" Onboarding Video

The "Start Here!" sheet is just a video link. This maps to the onboarding flow's welcome step — show the introduction video when a franchisee first enters the planning experience.

---

## 5. Decomposition Summary: Forms Mode vs Expert Mode

| Concept | Forms Mode (Sam / Guided) | Expert Mode (Jordan / Quick Entry) |
|---------|---------------------------|-----------------------------------|
| **Facilities** | Rent + Utilities + Telecom/IT + Vehicle Fleet + Insurance (5 sub-fields) | Single "Facilities ($)" per year |
| **Total Investment** | Startup Cost Builder (individual line items) | Single "Total Investment" or startup cost list |
| **Financing** | Savings + Other Equity + SBA Loan + Other Loans (sources) | Equity + Debt + Term + Rate |
| **Mgmt Salaries** | Owner salary + GM salary + Admin staff | Single "Mgmt & Admin Salaries ($)" per year |
| **Shareholder Adj** | Guided sweat equity flow (role → market rate → actual pay → adjustment) | Single adjustment value per year |
| **Direct Labor** | Optional staffing calculator (headcount × rate × hours) | Direct "% of Revenue" per year |
| **Distributions** | Guided with impact preview | Direct dollar amount per year |
| **All other fields** | Same as expert but with tooltips, benchmarks, and video links | Spreadsheet field directly |

**Key insight:** The decomposition is a **UI-layer concern only**. The engine always receives the consolidated spreadsheet-level values. Forms mode decomposes for understanding; Quick Entry shows the raw fields for speed. Both produce identical engine input.

---

## 6. Changes to Course Correction Proposals

### CP-1 Addendum (PRD FRs)

Add:
```
FR7l: Application includes contextual help for every input field — tooltip 
      explanation, benchmark value (where applicable), and link to explanatory 
      video content. Help content is sourced from the reference spreadsheet's 
      cell comments, glossary, and video links.

FR7m: Glossary page accessible from main navigation showing all financial 
      terms with plain-language definitions, calculation methods, industry 
      benchmarks, and links to video walkthroughs.

FR7n: In Forms mode, composite input fields (Facilities, Financing, Management 
      Salaries) are decomposed into guided sub-fields that are rolled up into 
      the engine's consolidated inputs. In Quick Entry mode, the same fields 
      appear in their consolidated spreadsheet-level form.
```

### CP-4 Addendum (Epic 5 stories)

Add to Story 5.8 (Glossary):
- Content sourced from reference spreadsheet's 15 glossary terms
- Each entry includes definition, benchmark, video link
- Accessible from main sidebar navigation
- Brand-configurable benchmarks

Add new story:

```
Story 5.10: Contextual Help & Video Integration

As a franchisee,
I want to see explanations, benchmarks, and video walkthroughs for every 
input field and output metric,
So that I understand what each number means even if I'm not a financial expert.

Acceptance Criteria:
- Every input field shows an info icon with tooltip text from spreadsheet comments
- Tooltip includes "Watch Video" link to Loom walkthrough (24 videos mapped)
- Tooltip includes "Learn More" link to Glossary entry (where applicable)
- Industry benchmarks displayed alongside input fields (from Glossary)
- Help content is stored as platform-level data, manageable by Katalyst admins
- Video links can be updated without code changes
```

### CP-3 Addendum (PlanFinancialInputs restructuring)

The decomposition analysis reveals that `PlanFinancialInputs` needs:

1. **Per-year structure** for ALL operating cost fields (addressed in CP-3)
2. **Decomposition metadata** for Forms mode: sub-fields stored in plan JSONB with a `composedFrom` mapping that shows how sub-values roll up into the engine field
3. **New fields:** managementSalaries (currently missing), payrollTaxPct (missing), distributions (missing), shareholderSalaryAdj (new), targetPreTaxProfitPct (new), ebitdaMultiple (new)
4. **Fix fields:** otherOpex from flat $ to % of revenue, facilities from 3-field split to single field (with sub-field decomposition as UI-layer overlay for Forms mode)

---

## 7. All Help Content Data — Ready for Seeding

The complete help content extracted from the spreadsheets can be seeded into the database as platform-level reference data:

- **15 Glossary terms** with definitions and benchmarks
- **24 Loom video URLs** mapped to specific input fields and output sections
- **33 tooltip texts** from cell comments mapped to specific fields
- **1 introduction video** for onboarding

All 4 brand spreadsheets share identical help content — this is platform-level, not brand-specific. The only brand-specific values are the actual benchmark numbers (which may vary by industry).
