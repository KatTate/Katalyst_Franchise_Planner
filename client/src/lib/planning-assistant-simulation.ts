import type { PlanFinancialInputs } from "@shared/financial-engine";

export interface SimulatedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  extractedValues?: Record<string, number>;
}

interface ConversationTopic {
  keywords: string[];
  response: string;
  extractedValues?: Record<string, number>;
  followUp: string;
}

const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    keywords: ["location", "rent", "lease", "space", "sqft", "square", "store", "shop", "site"],
    response:
      "That sounds like a great location! Based on what you've described, I've noted a monthly rent of $2,800 for your space. PostNet locations in similar markets typically range from $2,500 to $3,500 per month depending on the area. This is a solid foundation for your plan — rent is one of the biggest fixed costs, so getting this right early helps with accurate projections.",
    extractedValues: { "operatingCosts.facilitiesDecomposition.rent": 280000 },
    followUp: "Now let's talk about revenue expectations. What kind of monthly revenue are you anticipating? If you're not sure, I can share what similar PostNet franchisees in your market typically see.",
  },
  {
    keywords: ["revenue", "sales", "income", "money", "earn", "month", "auv", "volume"],
    response:
      "Great context! I've set your projected monthly revenue to $30,000 based on what you've shared. PostNet franchisees in similar markets typically see $25,000 to $35,000 per month once established. Of course, it takes time to ramp up — your first few months will likely be lower as you build your customer base. The financial projections will account for a growth ramp.",
    extractedValues: { "revenue.monthlyAuv": 3000000 },
    followUp: "Let's talk staffing next. How many employees are you planning to hire, and do you have a sense of what hourly wages look like in your area?",
  },
  {
    keywords: ["staff", "employee", "hire", "team", "worker", "wage", "salary", "people", "labor"],
    response:
      "That's a practical staffing plan. I've noted 4 employees at an average hourly wage of $16. For a PostNet location, that's typical — most start with 3-5 team members. As your business grows, you can adjust staffing levels. Labor costs are usually the second-largest expense after rent, so keeping this realistic from the start gives you a much clearer picture of profitability.",
    extractedValues: {
      "labor.numberOfEmployees": 4,
      "labor.averageHourlyWage": 1600,
    },
    followUp: "How about marketing? Do you have a monthly marketing budget in mind? Local marketing is especially important in the first year to build awareness.",
  },
  {
    keywords: ["marketing", "advertis", "promo", "budget", "campaign", "social", "digital"],
    response:
      "Smart thinking on marketing! I've set your monthly marketing budget to $1,500. PostNet recommends allocating between $1,000 and $2,000 per month for local marketing, especially in the first year. This typically covers local digital ads, direct mail, community sponsorships, and your Google Business profile optimization. A strong local presence early on accelerates your ramp to profitability.",
    extractedValues: { "marketing.monthlyMarketingBudget": 150000 },
    followUp: "We've covered the major categories! Would you like to review any specific area, or should I summarize what we've captured so far?",
  },
  {
    keywords: ["summary", "review", "done", "finish", "complete", "recap", "overview", "wrap"],
    response:
      "Here's a summary of what we've captured for your business plan:\n\n- **Monthly Rent:** $2,800\n- **Projected Monthly Revenue:** $30,000\n- **Team Size:** 4 employees at $16/hr average\n- **Marketing Budget:** $1,500/month\n\nYour financial dashboard on the right is already reflecting these values in your projections. I'd recommend heading over to the Reports section to see your full 5-year P&L, cash flow projections, and ROI analysis. You can always come back here to adjust any of these assumptions.",
    followUp: "",
  },
];

const FALLBACK_RESPONSES = [
  "That's helpful context! Let me note that down. What about your location — have you identified a space yet, and do you know what the monthly rent might be?",
  "Good to know! Every detail helps build a more accurate plan. Let's talk about your expected monthly revenue — do you have a target in mind?",
  "That's great context! I'm incorporating that into your plan. How about your staffing plans — how many employees are you thinking of hiring?",
  "Thanks for sharing that! Let me factor that in. Have you thought about your marketing budget for the first year?",
  "Interesting! I've made a note of that. Is there anything else you'd like to discuss about your business plan, or shall I give you a summary of what we've covered?",
];

let fallbackIndex = 0;

function matchTopic(
  message: string,
  usedTopics: Set<number>
): ConversationTopic | null {
  const lower = message.toLowerCase();
  for (let i = 0; i < CONVERSATION_TOPICS.length; i++) {
    if (usedTopics.has(i)) continue;
    const topic = CONVERSATION_TOPICS[i];
    if (topic.keywords.some((kw) => lower.includes(kw))) {
      return topic;
    }
  }
  return null;
}

function getNextUnusedTopic(usedTopics: Set<number>): ConversationTopic | null {
  for (let i = 0; i < CONVERSATION_TOPICS.length; i++) {
    if (!usedTopics.has(i)) return CONVERSATION_TOPICS[i];
  }
  return null;
}

function getFallbackResponse(usedTopics: Set<number>): string {
  const nextTopic = getNextUnusedTopic(usedTopics);
  if (nextTopic) {
    return `That's great context! Let me note that. ${nextTopic.followUp || "Tell me more about your plans."}`;
  }
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return response;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getGreeting(userName: string, brandName: string): SimulatedMessage {
  const firstName = userName.split(" ")[0] || userName;
  return {
    id: generateId(),
    role: "assistant",
    content: `Hi ${firstName}, I'm here to help you build your ${brandName} business plan. Tell me about your business — where are you planning to open?`,
    timestamp: new Date(),
  };
}

export async function* streamResponse(
  userMessage: string,
  history: SimulatedMessage[]
): AsyncGenerator<{ char: string; done: boolean; extractedValues?: Record<string, number> }> {
  const usedTopics = new Set<number>();
  for (const msg of history) {
    if (msg.role === "assistant" && msg.id !== "greeting") {
      for (let i = 0; i < CONVERSATION_TOPICS.length; i++) {
        if (msg.content.includes(CONVERSATION_TOPICS[i].response.slice(0, 40))) {
          usedTopics.add(i);
        }
      }
    }
  }

  const topic = matchTopic(userMessage, usedTopics);
  let responseText: string;
  let extractedValues: Record<string, number> | undefined;

  if (topic) {
    responseText = topic.response;
    if (topic.followUp) {
      responseText += "\n\n" + topic.followUp;
    }
    extractedValues = topic.extractedValues;
  } else {
    responseText = getFallbackResponse(usedTopics);
  }

  await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

  for (let i = 0; i < responseText.length; i++) {
    const delay = 20 + Math.random() * 30;
    await new Promise((r) => setTimeout(r, delay));
    const isLast = i === responseText.length - 1;
    yield {
      char: responseText[i],
      done: isLast,
      ...(isLast && extractedValues ? { extractedValues } : {}),
    };
  }
}

export type { ConversationTopic };
