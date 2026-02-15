# Course Correction Addendum: Guided Journey Field Decomposition & Help Content System

**Date:** 2026-02-15
**Updated:** 2026-02-15 (post-review corrections applied)
**Parent Document:** cc-2026-02-15-financial-output-layer.md
**Purpose:** Analyze which spreadsheet fields need decomposition for guided journeys, and catalog all embedded help content (video transcript guidance, comments, glossary) for integration into the application's guidance system

---

## 1. The Two-Layer Input Model

The spreadsheet represents the **expert-level view** — a seasoned operator (Jordan persona) who already thinks in financial statement structure. For the guided journey (Sam/Planning Assistant persona), some lumped fields need to be **decomposed into their component parts** and walked through with context.

**Design principles:**

1. **Engine consistency:** The engine always operates on the spreadsheet's consolidated fields. The UI layer handles decomposition (breaking apart for guided journeys) and recomposition (rolling up into engine inputs).

2. **All decomposition is opt-in.** Quick Entry always exists as the direct-entry path — a user can type the total Facilities amount just like they would in the spreadsheet. Forms mode offers the decomposed walkthrough for users who need it. That's literally half the point of having two modes.

3. **Decomposed sub-fields need their own help content.** The spreadsheet only has comments/guidance for the expert-level consolidated fields. Every sub-field we create through decomposition needs its own tooltip and explanation — the spreadsheet never needed these because it didn't decompose.

---

## 2. Field Decomposition Analysis

### 2.1 Fields That Benefit From Guided Decomposition (All Opt-In via Forms Mode)

These are spreadsheet fields where a first-time franchisee benefits from being walked through component parts. **All are opt-in** — Quick Entry always shows the consolidated spreadsheet-level field directly.

#### A. Facilities ($) → rent, utilities, telecom/IT, vehicle fleet

**Spreadsheet field:** `Facilities ($)` — single dollar amount per year
**Spreadsheet comment:** "Facilities should include rent, utilities, telecommunications, IT costs, and vehicle fleet."

**Current UI implementation:** Already decomposed into `rentMonthly`, `utilitiesMonthly`, `insuranceMonthly` — good instinct, but the sub-fields don't match the comment's decomposition and "insurance" isn't mentioned in the spreadsheet's definition.

**Recommended guided decomposition:**

| Sub-field | Unit | Guidance (new — not from spreadsheet) |
|-----------|------|---------------------------------------|
| Rent / Lease | $/month | "Your monthly lease payment for the franchise location. Check your lease agreement or get an estimate from your broker." |
| Utilities | $/month | "Electric, gas, water, and sewer costs. Ask the landlord or previous tenant for typical monthly costs at this location." |
| Telecommunications & IT | $/month | "Phone lines, internet service, POS system subscriptions, and any software you'll need to run the business." |
| Vehicle Fleet | $/month | "If your franchise uses vehicles (delivery, service calls), include lease payments, fuel, and maintenance. Skip if not applicable." |
| Insurance | $/month | "Property insurance, general liability, and workers' compensation. Your franchisor may have recommended carriers with estimated costs." |

**Engine mapping:** Sum all sub-fields → `facilitiesAnnual[year]` (x 12 for annual)
**Quick Entry:** Shows single "Facilities ($)" per year, matching spreadsheet
**Forms:** Walks through each sub-field with the guidance text above

#### B. Total Investment Required → startup cost line items

**Spreadsheet field:** `Total investment required` — single number
**Spreadsheet sub-fields:** `CapEx investments`, `Non-CapEx investments`, `Working Capital / Additional Funds`

**Current implementation:** Already decomposed via the Startup Cost Builder (Epic 2) with individual line items classified as capex/non_capex/working_capital. This is the strongest example of guided decomposition already working correctly.

**Status:** Already correct. Startup costs serve this purpose well.

#### C. Equity / Cash Injection + Debt → financing sources

**Spreadsheet fields:** `Equity / Cash Injection`, `Debt`, `Debt Term (Months)`, `Debt Interest Rate`
**Spreadsheet comment:** "In Financing, additional equity / cash injection can be added post start of operations" and "SBA Loans are typically 10 years (120 months) at around 10-10.5%"

**Guided decomposition:**

| Sub-field | Unit | Guidance (new — not from spreadsheet) |
|-----------|------|---------------------------------------|
| Personal savings / cash available | $ | "How much of your own money are you planning to invest in this franchise?" |
| Additional investor equity | $ | "Will anyone else — a partner, family member, or investor — be putting money in alongside you?" |
| SBA loan amount | $ | "Are you planning to use an SBA loan? These are the most common financing option for franchise purchases." |
| Other loan amount | $ | "Any other financing sources? This could include a HELOC, 401(k) rollover (ROBS), family loan, or equipment financing." |
| Loan term | months | "How long is your loan term? SBA loans are typically 10 years (120 months)." |
| Interest rate | % | "What's your expected interest rate? SBA loans are typically around 10-10.5%." |

**Engine mapping:** Sum equity sources → equity injection. Sum loan sources → debt. Check: equity + debt >= total investment.
**Quick Entry:** Shows spreadsheet's 4 fields directly
**Forms:** Walks through financing sources with guidance

#### D. Management & Admin Salaries ($) → role-based compensation

**Spreadsheet field:** `Management & Admin Salaries ($)` — single dollar amount per year
**Spreadsheet comment:** "This field would include 'gross wages' of non-direct employees. We define non-direct as anyone who spends less than 50% of their time working on revenue producing activities."

**Guided decomposition:**

| Sub-field | Unit | Guidance (new — not from spreadsheet) |
|-----------|------|---------------------------------------|
| Owner/operator salary | $/year | "What annual salary will you pay yourself? If you plan to work without pay initially, enter $0 here — we'll account for that in the Shareholder Salary Adjustment." |
| General manager salary | $/year | "If you're hiring a general manager or store manager, what's their expected annual salary? Leave blank if you'll be managing the business yourself." |
| Admin/office staff | $/year | "Total annual salaries for any other non-revenue-producing staff — bookkeeper, office manager, receptionist. These are people who spend less than 50% of their time on revenue-producing activities." |

**Engine mapping:** Sum all → `managementSalariesAnnual[year]`
**Quick Entry:** Shows single "Mgmt & Admin Salaries" per year
**Forms:** Walks through expected roles

#### E. Shareholder Salary Adjustment → guided explanation of sweat equity

**Spreadsheet field:** `Shareholder salary adjustment (+=underpayed)` — per year
**Spreadsheet comment:** "Sometimes a business owner will decide to perform a job within the business that should pay a certain salary per year, but they go without pay instead in order to preserve capital (sweat equity). This is the same as putting that amount into the business as an investor..."

**Not decomposition but a guided explanation.** This concept is confusing for first-time franchisees. The guided journey should:
1. Ask: "Will you be working in the business yourself?"
2. If yes: "What role will you perform?" (links to Mgmt & Admin roles above)
3. "What would you hire someone to do that job for?" → that's the market rate
4. "What salary will you actually take?" → the difference is the adjustment
5. If Year 1 salary is $0 but market rate is $55K, adjustment = $55,000

**Sub-field guidance (new):**

| Sub-field | Unit | Guidance |
|-----------|------|----------|
| Market rate for your role | $/year | "If you had to hire someone to do everything you'll be doing in the business, what would you pay them annually?" |
| Your actual salary | $/year | "What salary will you actually draw? (This should match what you entered in Management & Admin Salaries for your role.)" |
| Adjustment (computed) | $/year | "The difference between the market rate and your actual salary. This represents your 'sweat equity' — the value of your unpaid labor invested in the business." |

**Engine mapping:** Market rate - actual salary → `shareholderSalaryAdj[year]` (new engine input)
**Quick Entry:** Shows the raw adjustment number per year
**Forms:** Multi-step guided flow explaining sweat equity concept

#### F. Direct Labor Cost (% of Revenue) → optional staffing calculator

**Spreadsheet field:** `Direct Labor Cost (% of Revenue)` — percentage per year
**Spreadsheet comment:** "This field would include 'gross wages' of direct employees as a percentage of gross revenues. We define direct as anyone who spends more than 50% of their time working on revenue producing activities."

**Optional guided decomposition (staffing calculator):**

| Sub-field | Unit | Guidance (new) |
|-----------|------|----------------|
| Number of full-time employees | count | "How many full-time employees will be directly producing revenue? These are people who spend more than 50% of their time on revenue-producing activities." |
| Average hourly wage | $/hour | "What's the typical hourly rate for these positions in your market?" |
| Average hours/week | hours | "How many hours per week does each full-time employee work? Standard is 40." |
| Number of part-time employees | count | "Any part-time revenue-producing employees?" |
| Part-time avg hours/week | hours | "Average weekly hours for part-time staff." |

**Engine mapping:** Calculate total annual labor cost → divide by projected revenue → `laborPct[year]`
**Quick Entry:** Shows the percentage directly
**Forms:** Offers staffing calculator as an optional tool — many franchisees already know their labor % from the FDD and can enter it directly even in Forms mode

#### G. Distributions → guided with impact context

**Spreadsheet field:** `Estimated Distributions from the Company` — per year
**Glossary definition:** "Amounts of money taken out of the business by the owners or partners."

**Not decomposition but contextual guidance needed.** The guided flow should explain that distributions affect cash flow and ROIC, and that taking distributions too early can deplete core capital.

**Guidance text (new):** "Distributions are money you take out of the business for personal use — essentially your 'paycheck' beyond salary. In the early years, most franchise owners reinvest profits back into the business. Be cautious about taking distributions before you've built adequate core capital (at least 2 months of operating expenses in reserve)."

### 2.2 Fields That Do NOT Need Decomposition

These fields are already atomic in the spreadsheet and map directly to the engine. In both Forms and Quick Entry modes, they appear the same way — the only difference is that Forms mode includes contextual help tooltips.

| Field | Why No Decomposition Needed |
|-------|---------------------------|
| AUV / Gross Sales | Single number, typically from FDD Item 19 |
| Time to Reach AUV | Single number, franchisee estimates |
| Starting Month AUV % | Single percentage |
| Corporation Tax | Standard rate (21% federal) |
| EBITDA Multiple | Single industry metric |
| Annual Growth Rate | Single % per year |
| Royalty Fee | From franchise agreement (fixed) |
| Ad Fund / Marketing Fee | From franchise agreement (fixed) |
| Materials COGS | Standard % from FDD |
| Marketing | Single % per year |
| Payroll Taxes & Benefits | Standard % |
| Other Operating Expenses | Catchall % per year |
| Target Pre-tax Profit | Target % |
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

## 3. Help Content System — Guidance Content Inventory

The spreadsheets contain a rich help content system. The application should replicate the **guidance content** (not the videos themselves) from these sources:

### 3.1 Loom Video Content → Text-Based Guidance

**Critical distinction:** We need to extract and use the **content and teaching** from the Loom walkthrough videos, not embed or link to the videos themselves. The videos explain concepts, walk through examples, and provide context — that guidance should be distilled into text-based help content within the application.

There are 25 Loom videos covering every input field and output section. Their content needs to be watched, transcribed/summarized, and converted into:
- **Tooltip explanations** — brief inline help (1-2 sentences)
- **Expanded help panels** — deeper explanation accessible via "Learn more" (1-2 paragraphs)
- **Guided flow context** — step-by-step explanations used in Forms mode walkthroughs

**Videos to extract content from:**

| Category | Field / Section | Loom URL (for content extraction) |
|----------|----------------|----------------------------------|
| **Introduction** | Overall intro | https://www.loom.com/share/a3e62906065740968310777238a8d74b |
| **General** | Input Assumptions overview | https://www.loom.com/share/44b07e263f6d41cf95ca8b439e5ea7f9 |
| **Setup** | Start of Business Operations | https://www.loom.com/share/6f6062eee0ad4efb816c835aa8bab046 |
| **Revenue** | Gross Sales / AUV | https://www.loom.com/share/72c933ae985340ac8c486c8bd334b4a3 |
| **Revenue** | Time to Reach AUV | https://www.loom.com/share/effebce43de94ecd9a28cf59f7db72c5 |
| **Revenue** | Starting Month AUV % | https://www.loom.com/share/dc706d587ed24734a8c830fd7eec1bd2 |
| **Tax** | Corporation Tax | https://www.loom.com/share/9048ebc4cf4948fc9464628c4a8c5660 |
| **Valuation** | EBITDA Multiple | https://www.loom.com/share/bfbbe58a534a4df383dd201eae8d6ca4 |
| **Revenue** | Annual Growth Rate | https://www.loom.com/share/2ba3805fb19442cd8f4a191c5537da07 |
| **Fees** | Franchise Fees (Royalty) | https://www.loom.com/share/32f4599ae9574be5877a41773f7f2dc7 |
| **OpEx** | Materials COGS | https://www.loom.com/share/d84fe9b1ba0e472680571dd09df9746b |
| **OpEx** | Direct Labor Cost | https://www.loom.com/share/5b51d205a4144b1cb09f2e02c628c529 |
| **OpEx** | Facilities | https://www.loom.com/share/56ad5880cda64717ae59b351afa733b9 |
| **OpEx** | Marketing | https://www.loom.com/share/bbd2aa97ddb24f68b2c0608002224fce |
| **OpEx** | Management & Admin Salaries | https://www.loom.com/share/b22de84d079b4167afdfc92c54d12982 |
| **OpEx** | Payroll Taxes & Benefits | https://www.loom.com/share/c84353c830c9435d94ccaaf3daf7afdf |
| **OpEx** | Other Operating Expenses | https://www.loom.com/share/d749251844d3443c9f3cb3bf5afe5cad |
| **P&L** | Shareholder Salary Adjustment | https://www.loom.com/share/f2eed8e7f63348098282963116a02539 |
| **Investment** | Total Investment Spending | https://www.loom.com/share/f99eea6aea6c4fa69a8f628dff89b7af |
| **Financing** | Equity/Debt | https://www.loom.com/share/867db553358644df8c31c4447d971180 |
| **Distributions** | Distributions | https://www.loom.com/share/f643dd1e41264cf7a6029d826c7c069e |
| **Output** | Net Profit Before Tax | https://www.loom.com/share/a38dbeb6fa4f463ebc91a3180cf588f1 |
| **Output** | Labor Efficiency | https://www.loom.com/share/ecd3c7e4ecc34e669199a79af486838f |
| **Output** | Breakeven Analysis | https://www.loom.com/share/d90d5507c8fd438488337e2b10213945 |
| **Output** | Payback Period | https://www.loom.com/share/b7b15b4a670447298ddba721eb1cd071 |
| **Output** | Returns on Invested Capital | https://www.loom.com/share/9cfebc103a914c4c95a2c0e694ab1610 |
| **Output** | Valuation | https://www.loom.com/share/87ba3a6ee9b541d4be4d8edf40946733 |

**Action item:** Content extraction from these videos is a prerequisite task — watch each video, distill the teaching into structured help text, and store as platform-level guidance data.

### 3.2 Cell Comments (33-34 per spreadsheet) → Tooltip Text

Every editable input field has a threaded comment explaining what to enter and why. These become the **base tooltip text** for each field. Key comments extracted:

**Revenue & Growth:**
- Time to AUV: "The number of months it will take to reach 'Average Unit Volume' (AUV), otherwise known as average Gross Sales or Revenue, from the start of business operations date."
- Starting Month AUV %: "Input the estimated % of monthly AUV that the business is expected to achieve in the first month."
- Growth Rate vs AUV: "Please be aware that the Time to Reach AUV (months) takes precedence over the annual growth rate input. The annual growth rate until the AUV is reached will be determined by the Time to Reach AUV input. After the AUV is reached, then the Annual Growth Rate will be used."

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

**Note:** These comments only cover the spreadsheet's consolidated fields. Decomposed sub-fields (rent, utilities, telecom, etc.) need **new guidance text written specifically for them** — see Section 2.1 for the sub-field guidance content.

### 3.3 Glossary Content (15 terms — definitions only, no universal benchmarks)

The spreadsheet Glossary includes benchmark values, but these are **industry-specific** and customized per spreadsheet. Since we work across multiple industries, **benchmarks must not be hardcoded in the glossary.** If benchmarks are shown, they come from **brand defaults** configured by the franchisor.

**Glossary terms — definitions only:**

| Term | Definition (abbreviated) |
|------|------------------------|
| Payback Period | Time for investment to generate amount equal to initial cost |
| EBITDA | Earnings before interest, taxes, depreciation, amortization — scorecard for core operational performance |
| Adj Net Profit Before Tax | Net Profit adjusted for owner salary shortfall — shows "true" business performance |
| Shareholder Salary Adjustment | Amount owner is "underpaid" — sweat equity concept |
| EBITDA Multiple | How much people pay for a business relative to EBITDA |
| Average Unit Volume (AUV) | Average sales per franchise unit per year |
| Direct Labor Cost | Gross wages of employees spending >50% time on revenue activities |
| Facilities | Rent, utilities, telecom, IT, vehicle fleet |
| Equity - Cash | Outside equity invested into the business |
| Core Capital | Monthly opex + labor in cash, nothing on LOC |
| Estimated Distributions | Money taken out by owners after bills paid |
| ROIC | Return on invested capital — gain/loss as % of initial cost |
| Breakeven | Point where costs and income are equal |
| Number of Months to Breakeven | Months from open to breakeven |
| Cash Flow | Money coming into and going out of the business |

**Benchmark handling:** Brand configuration (Epic 2) already supports brand-specific parameter defaults. Benchmark values for glossary display should be sourced from the active brand's configuration — not from a universal table.

---

## 4. Proposed Help Content Architecture

### 4.1 Glossary as Main Menu Feature

**Proposal:** Glossary becomes a navigable page in the main sidebar menu, available to all franchisees regardless of planning mode. This replaces the spreadsheet's Glossary tab.

**Content structure per term:**
- Term name
- Plain-language definition (from glossary — universal across brands)
- How it's calculated (from engine logic)
- Brand-specific benchmark (from brand defaults, if configured by franchisor — not universal)
- "See it in your plan" link → navigates to the relevant financial statement section

**Implementation:** Store glossary definitions as platform-level data (definitions are universal). Benchmark values are sourced from brand configuration at display time — they are NOT stored in the glossary itself.

### 4.2 Contextual Help Tooltips

**Proposal:** Every input field — both the consolidated spreadsheet-level fields AND decomposed sub-fields — shows an info icon that expands to show:
1. Tooltip text (from spreadsheet comments for consolidated fields; newly written for decomposed sub-fields)
2. A "Learn more" link to the Glossary entry (if one exists)
3. Brand-specific benchmark (from brand defaults, if available)

This replicates the spreadsheet's comment-on-hover experience but extends it to cover the guided decompositions that the spreadsheet never needed.

### 4.3 Help Content as Platform-Level Text Data

**Structure:**

```
HelpContent {
  fieldKey: string          // e.g., "input.facilities", "input.facilities.rent"
  tooltipText: string       // Brief explanation (1-2 sentences)
  expandedHelp: string      // Deeper explanation (1-2 paragraphs, from video content extraction)
  glossaryTermSlug: string | null  // Links to glossary entry
  parentFieldKey: string | null    // For decomposed sub-fields, links to parent
}
```

**Key distinction from previous version:** No video URLs stored. The video content is extracted into `tooltipText` and `expandedHelp` text fields. The guidance lives in the application, not behind external video links.

---

## 5. Decomposition Summary: Forms Mode vs Quick Entry

| Concept | Forms Mode (Guided — Opt-In Decomposition) | Quick Entry (Direct — Spreadsheet Fields) |
|---------|---------------------------------------------|------------------------------------------|
| **Facilities** | Rent + Utilities + Telecom/IT + Vehicle Fleet + Insurance (5 sub-fields, each with own guidance) | Single "Facilities ($)" per year |
| **Total Investment** | Startup Cost Builder (individual line items) | Single "Total Investment" or startup cost list |
| **Financing** | Savings + Other Equity + SBA Loan + Other Loans (sources) | Equity + Debt + Term + Rate |
| **Mgmt Salaries** | Owner salary + GM salary + Admin staff | Single "Mgmt & Admin Salaries ($)" per year |
| **Shareholder Adj** | Guided sweat equity flow (role → market rate → actual pay → adjustment) | Single adjustment value per year |
| **Direct Labor** | Optional staffing calculator (headcount x rate x hours) | Direct "% of Revenue" per year |
| **Distributions** | Guided with impact context | Direct dollar amount per year |
| **All other fields** | Same field as expert mode but with tooltips and guidance | Spreadsheet field with tooltips |

**Design principles:**
1. The decomposition is a **UI-layer concern only.** The engine always receives the consolidated spreadsheet-level values.
2. **All decomposition is opt-in** because Quick Entry always exists as the direct-entry path. A user who knows their total Facilities number just types it in Quick Entry. A user who needs to think through the components uses Forms.
3. Both modes produce **identical engine input.** There is no data model difference — only presentation difference.
4. **Every sub-field needs its own guidance text.** The spreadsheet's comments only cover consolidated fields. We must write new guidance for every decomposed sub-field since the spreadsheet was designed for experts only.

---

## 6. Changes to Course Correction Proposals

### CP-1 Addendum (PRD FRs)

Add:
```
FR7l: Application includes contextual help for every input field — tooltip 
      explanation and expanded guidance. Help content covers both consolidated 
      spreadsheet-level fields (sourced from reference spreadsheet comments and 
      video content) AND decomposed sub-fields in Forms mode (newly authored 
      guidance). Content is stored as platform-level text data, not external 
      video links.

FR7m: Glossary page accessible from main navigation showing all financial 
      terms with plain-language definitions and calculation methods. Benchmark 
      values, where shown, are sourced from brand-specific defaults configured 
      by the franchisor — not from universal industry averages.

FR7n: In Forms mode, composite input fields (Facilities, Financing, Management 
      Salaries, Shareholder Salary Adjustment, and optionally Direct Labor) are 
      decomposed into guided sub-fields with their own help content that are 
      rolled up into the engine's consolidated inputs. In Quick Entry mode, the 
      same fields appear in their consolidated spreadsheet-level form. All 
      decomposition is opt-in — Quick Entry always provides the direct path.
```

### CP-4 Addendum (Epic 5 stories)

Update Story 5.8 (Glossary):
- Content sourced from reference spreadsheet's 15 glossary terms (definitions only)
- Benchmarks shown from brand defaults, NOT universal values
- Accessible from main sidebar navigation

Update Story 5.10 (renamed from "Contextual Help & Video Integration"):

```
Story 5.10: Contextual Help & Guidance Content

As a franchisee,
I want to see explanations and guidance for every input field and output 
metric — including the sub-fields that only appear in Forms mode,
So that I understand what each number means even if I'm not a financial expert.

Acceptance Criteria:
- Every input field shows an info icon with tooltip text
- Consolidated fields use guidance sourced from spreadsheet comments and 
  extracted video content
- Decomposed sub-fields in Forms mode have their own newly-authored guidance
  (the spreadsheet never decomposed these, so new help text is required)
- Tooltip includes "Learn More" link to Glossary entry (where applicable)
- Benchmarks alongside input fields come from brand defaults (not universal)
- Help content is stored as platform-level text data, manageable by Katalyst admins
- No external video embeds or links — all guidance is text-based within the app
```

### CP-3 Addendum (PlanFinancialInputs restructuring)

The decomposition analysis reveals that `PlanFinancialInputs` needs:

1. **Per-year structure** for ALL operating cost fields (addressed in CP-3)
2. **Decomposition metadata** for Forms mode: sub-fields stored in plan JSONB with a `composedFrom` mapping that shows how sub-values roll up into the engine field
3. **New fields:** managementSalaries (currently missing), payrollTaxPct (missing), distributions (missing), shareholderSalaryAdj (new), targetPreTaxProfitPct (new), ebitdaMultiple (new)
4. **Fix fields:** otherOpex from flat $ to % of revenue, facilities from 3-field split to single field (with sub-field decomposition as UI-layer overlay for Forms mode)

---

## 7. All Help Content Data — Summary

The complete help content to be created for the application:

- **15 Glossary terms** with definitions (no universal benchmarks — benchmarks from brand defaults)
- **33 tooltip texts** from cell comments mapped to consolidated fields
- **~20 new tooltip texts** to be authored for decomposed sub-fields (not in spreadsheet)
- **25 Loom videos** to have content extracted into structured text guidance (tooltip + expanded help format)
- **Prerequisite task:** Watch and transcribe/summarize each Loom video to extract the teaching content into text-based guidance

All 4 brand spreadsheets share identical help content structure — glossary terms and comments are platform-level. Benchmark values are the only brand-specific element and come from brand configuration, not the glossary.
