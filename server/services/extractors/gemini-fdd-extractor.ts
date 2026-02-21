import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FddExtractionResult, BrandParameters, StartupCostTemplate } from "@shared/schema";
import type { FddExtractor } from "../fdd-ingestion-service";

const EXTRACTION_PROMPT = `You are a financial data extraction specialist. Analyze this Franchise Disclosure Document (FDD) PDF and extract structured financial data.

CRITICAL RULES:
- All dollar amounts must be in DOLLARS (not cents). The system will handle conversion.
- All percentage values must be DECIMALS (e.g., 5% = 0.05, 6.5% = 0.065).
- If a field is not found in the document, DO NOT include it — omit it entirely.
- Focus primarily on Item 7 (Estimated Initial Investment) for startup costs.
- Look for franchise fee, royalty fee, ad fund fee, and other recurring fees throughout the document.
- For startup cost items, extract the low and high range from Item 7 if available.

Extract the following structured data:

1. **Financial Parameters** (partial — only include fields found in the FDD):
   - revenue.monthly_auv: Average Unit Volume per month (if disclosed)
   - operating_costs.royalty_pct: Ongoing royalty fee as decimal
   - operating_costs.ad_fund_pct: Advertising/marketing fund fee as decimal
   - operating_costs.rent_monthly: Estimated monthly rent (if in Item 7)
   - operating_costs.insurance_monthly: Estimated monthly insurance (if in Item 7)
   - financing.loan_amount: Estimated total investment (middle of Item 7 range)
   - financing.interest_rate: If financing terms disclosed
   - financing.loan_term_months: If financing terms disclosed

2. **Startup Cost Line Items** from Item 7 table:
   For each line item, extract:
   - id: Generate a unique UUID
   - name: The line item name
   - default_amount: The midpoint of the range in DOLLARS (or exact amount if single value)
   - capex_classification: "capex" for equipment/buildout/fixtures, "non_capex" for fees/deposits/training, "working_capital" for working capital/additional funds
   - item7_range_low: Low estimate in DOLLARS (null if not a range)
   - item7_range_high: High estimate in DOLLARS (null if not a range)
   - sort_order: Sequential order as they appear in the document

3. **Confidence ratings** for each extracted field:
   - "high": Clearly stated in the document with exact values
   - "medium": Derived or calculated from document data
   - "low": Estimated or inferred from context

4. **Extraction notes**: Any important observations about the extraction.

Brand name for context: {BRAND_NAME}

Respond with ONLY valid JSON in this exact structure:
{
  "parameters": {
    "revenue": { "monthly_auv": { "value": <number>, "label": "Monthly AUV", "description": "<from FDD>" } },
    "operating_costs": {
      "royalty_pct": { "value": <decimal>, "label": "Royalty %", "description": "<from FDD>" },
      "ad_fund_pct": { "value": <decimal>, "label": "Ad Fund %", "description": "<from FDD>" }
    },
    "financing": { ... }
  },
  "startupCosts": [
    {
      "id": "<uuid>",
      "name": "<item name>",
      "default_amount": <dollars>,
      "capex_classification": "capex"|"non_capex"|"working_capital",
      "item7_range_low": <dollars|null>,
      "item7_range_high": <dollars|null>,
      "sort_order": <number>
    }
  ],
  "confidence": {
    "operating_costs.royalty_pct": "high",
    "operating_costs.ad_fund_pct": "high",
    "startupCosts": "high"
  },
  "extractionNotes": ["Note 1", "Note 2"]
}

Only include parameter categories and fields that were actually found in the FDD. Omit any field not present.`;

export class GeminiFddExtractor implements FddExtractor {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extract(pdfBuffer: Buffer, brandName: string): Promise<FddExtractionResult> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = EXTRACTION_PROMPT.replace("{BRAND_NAME}", JSON.stringify(brandName));

    const pdfBase64 = pdfBuffer.toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    const extractionResult: FddExtractionResult = {
      parameters: parsed.parameters || {},
      startupCosts: Array.isArray(parsed.startupCosts) ? parsed.startupCosts : [],
      confidence: parsed.confidence || {},
      extractionNotes: Array.isArray(parsed.extractionNotes) ? parsed.extractionNotes : [],
    };

    return extractionResult;
  }
}
