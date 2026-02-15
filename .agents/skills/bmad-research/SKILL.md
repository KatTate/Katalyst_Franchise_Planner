---
name: bmad-research
description: >
  BMAD Method: Conduct research using web data and verified sources. Supports
  three types: market research (MR), domain research (DR), and technical
  research (TR). Use when user says "market research", "domain research",
  "technical research", "MR", "DR", "TR", or needs competitive analysis,
  industry deep dive, or technical feasibility study. Phase 1 Analysis workflow.
---

# BMAD Research Workflows

This skill handles all three BMAD research types. Determine which type the user
needs and load the corresponding workflow.

## Market Research (MR)

When user says "market research", "MR", "competitive analysis", "market analysis":

Read fully and follow: `_bmad/bmm/workflows/1-analysis/research/workflow-market-research.md`

Covers: market size, growth, competition, and customer insights.

## Domain Research (DR)

When user says "domain research", "DR", "industry research", "domain deep dive":

Read fully and follow: `_bmad/bmm/workflows/1-analysis/research/workflow-domain-research.md`

Covers: industry analysis, regulations, technology trends, ecosystem dynamics.

## Technical Research (TR)

When user says "technical research", "TR", "tech feasibility", "technology research":

Read fully and follow: `_bmad/bmm/workflows/1-analysis/research/workflow-technical-research.md`

Covers: technology evaluation, architecture decisions, implementation approaches.

## Market Research Steps (6 Total)

1. **Step 1: Initialization** (`market-steps/step-01-init.md`) — Confirm research understanding, refine market research scope, document initial scope, present [C] Continue option
2. **Step 2: Customer Behavior** (`market-steps/step-02-customer-behavior.md`) — Analyze customer behavior patterns, purchase drivers, usage trends using web search with source verification
3. **Step 3: Customer Pain Points** (`market-steps/step-03-customer-pain-points.md`) — Identify and analyze customer frustrations, unmet needs, and pain point severity using web research
4. **Step 4: Customer Decisions** (`market-steps/step-04-customer-decisions.md`) — Research customer decision-making factors, buying criteria, and decision journey mapping
5. **Step 5: Competitive Analysis** (`market-steps/step-05-competitive-analysis.md`) — Comprehensive competitive landscape analysis, market positioning, competitive advantages and gaps
6. **Step 6: Research Completion** (`market-steps/step-06-research-completion.md`) — Strategic synthesis, generate complete market research document with executive summary, TOC, source documentation, and strategic recommendations

## Domain Research Steps (6 Total)

1. **Step 1: Initialization** (`domain-steps/step-01-init.md`) — Confirm domain research scope, define analysis areas (industry, regulatory, technology, economic, supply chain), present [C] Continue option
2. **Step 2: Domain Analysis** (`domain-steps/step-02-domain-analysis.md`) — Industry structure analysis, market dynamics, value chain mapping using web research
3. **Step 3: Competitive Landscape** (`domain-steps/step-03-competitive-landscape.md`) — Key players, competitive dynamics, market positioning analysis
4. **Step 4: Regulatory Focus** (`domain-steps/step-04-regulatory-focus.md`) — Compliance requirements, regulatory frameworks, legal considerations using web research
5. **Step 5: Technical Trends** (`domain-steps/step-05-technical-trends.md`) — Technology adoption patterns, innovation landscape, digital transformation trends
6. **Step 6: Research Synthesis** (`domain-steps/step-06-research-synthesis.md`) — Comprehensive synthesis, generate complete domain research document with executive summary, TOC, strategic recommendations, and source verification

## Technical Research Steps (6 Total)

1. **Step 1: Initialization** (`technical-steps/step-01-init.md`) — Confirm technical research scope, define analysis areas (architecture, implementation, tech stack, integration, performance), present [C] Continue option
2. **Step 2: Technical Overview** (`technical-steps/step-02-technical-overview.md`) — Technology stack landscape, current adoption patterns, framework comparisons using web research
3. **Step 3: Integration Patterns** (`technical-steps/step-03-integration-patterns.md`) — API design patterns, service integration approaches, data exchange patterns
4. **Step 4: Architectural Patterns** (`technical-steps/step-04-architectural-patterns.md`) — System design principles, architectural trade-offs, best practice patterns
5. **Step 5: Implementation Research** (`technical-steps/step-05-implementation-research.md`) — Development methodologies, coding patterns, quality assurance practices, deployment strategies
6. **Step 6: Research Synthesis** (`technical-steps/step-06-research-synthesis.md`) — Comprehensive synthesis, generate complete technical research document with executive summary, TOC, strategic recommendations, security/compliance analysis, and source verification

## Commonly Missed Steps

- ⚠️ **Step 1 (All Types) — Scope Confirmation**: Agents skip scope confirmation and jump straight to web research. The init step exists to confirm understanding and let the user refine scope BEFORE research begins. No web research should happen in Step 1.
- ⚠️ **Step 6 (All Types) — Complete Document Structure**: Agents generate abbreviated final documents missing the comprehensive TOC, executive summary, source documentation, and appendices. The synthesis step requires producing a COMPLETE authoritative document, not a summary.
- ⚠️ **Step 6 — Source Verification Section**: Agents skip generating the methodology and source verification section, which documents all sources used and provides confidence level assessments. This is essential for research credibility.
- ⚠️ **Market Steps 2-4 — Individual Customer Analysis Steps**: Agents tend to collapse customer behavior, pain points, and decision analysis into a single step. These are three distinct steps that each require separate web searches and analysis.
- ⚠️ **All Steps — Web Search Requirement**: Agents sometimes rely on training data instead of performing actual web searches. Every research step (2+) REQUIRES web search to verify and supplement with current facts.

## Critical Rules (All Research Types)

- ⛔ Web search is REQUIRED — if unavailable, abort and tell the user immediately
- NEVER skip steps or optimize the sequence — each step has a distinct research focus
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS use verified sources with proper citations — never present unverified claims as facts
- ALWAYS perform actual web searches in steps 2+ — do NOT rely solely on training data
- NEVER generate research content in the initialization step — Step 1 is scope confirmation only
- NEVER collapse multiple research steps into one — each step targets a different research dimension
- ALWAYS produce complete document structure in the synthesis step with executive summary, TOC, and source documentation
- ALWAYS present [C] Continue/Complete option and wait for user selection before proceeding
- This is a COLLABORATION — user brings domain knowledge, you bring research methodology

## What's Next

After research, the typical next steps are:
- **Create Brief (CB)** — if defining a new product idea
- **Create PRD (CP)** — if research was to inform requirements
