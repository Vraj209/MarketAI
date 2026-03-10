import { getOpenAIClient } from "@/lib/integrations/openai/client";
import {
  FinancialReportRequest,
  FinancialReportResult,
  financialReportResultSchema,
} from "@/lib/validations/financial-report";

export type FinancialReportTimingsMs = {
  parseInputMs: number;
  aiAnalysisMs: number;
  normalizationMs: number;
  totalMs: number;
};

export type FinancialReportStepOutputs = {
  parseInput: {
    periodType: string;
    periodCount: number;
    totalRevenue: number;
    totalExpenses: number;
    totalMarketingSpend: number;
  };
  aiAnalysis: {
    model: string;
    rawOutputPreview: string;
  };
  normalization: {
    nextPeriodFocus: string;
    actionCount: number;
    priorityCount: number;
  };
};

export type FinancialReportWorkflowResult = {
  result: FinancialReportResult;
  timingsMs: FinancialReportTimingsMs;
  stepOutputs: FinancialReportStepOutputs;
};

export async function runFinancialReportWorkflow(
  input: FinancialReportRequest,
): Promise<FinancialReportWorkflowResult> {
  const totalStart = Date.now();

  const parseStart = Date.now();
  const totals = summarizePeriods(input.periods);
  const parseInputMs = Date.now() - parseStart;

  const aiStart = Date.now();
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          "You are a business and marketing analyst. Evaluate financial data and return strict JSON only. Be specific and actionable.",
      },
      {
        role: "user",
        content: [
          "Analyze this business financial statement and predict next steps for marketing.",
          `Period type: ${input.periodType}`,
          `Business: ${input.businessName ?? "Not provided"}`,
          `Goals: ${input.goals ?? "Not provided"}`,
          `Periods data: ${JSON.stringify(input.periods)}`,
          `Totals: ${JSON.stringify(totals)}`,
          "Return JSON with: executiveSummary, nextPeriodFocus (one of: email_marketing, content_social, balanced, experiment), nextPeriodFocusReason, predictedNextSteps[], emailMarketingActions[], contentPlatformActions[], priorityActions[{action,channel,impact,timeframe}], revenueTrend, marketingEfficiencyNote, risks[].",
        ].join("\n"),
      },
    ],
  });
  const aiAnalysisMs = Date.now() - aiStart;

  const normStart = Date.now();
  const parsed = parseJsonFromModelOutput(response.output_text);
  const result = financialReportResultSchema.parse(normalizeReportPayload(parsed));
  const normalizationMs = Date.now() - normStart;
  const totalMs = Date.now() - totalStart;

  return {
    result,
    timingsMs: { parseInputMs, aiAnalysisMs, normalizationMs, totalMs },
    stepOutputs: {
      parseInput: {
        periodType: input.periodType,
        periodCount: input.periods.length,
        totalRevenue: totals.totalRevenue,
        totalExpenses: totals.totalExpenses,
        totalMarketingSpend: totals.totalMarketingSpend,
      },
      aiAnalysis: {
        model: "gpt-4.1",
        rawOutputPreview: response.output_text.slice(0, 2000),
      },
      normalization: {
        nextPeriodFocus: result.nextPeriodFocus,
        actionCount:
          result.emailMarketingActions.length + result.contentPlatformActions.length,
        priorityCount: result.priorityActions.length,
      },
    },
  };
}

function summarizePeriods(
  periods: FinancialReportRequest["periods"],
): { totalRevenue: number; totalExpenses: number; totalMarketingSpend: number } {
  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalMarketingSpend = 0;
  for (const p of periods) {
    totalRevenue += p.revenue;
    totalExpenses += p.expenses;
    totalMarketingSpend += p.marketingSpend ?? 0;
  }
  return { totalRevenue, totalExpenses, totalMarketingSpend };
}

function parseJsonFromModelOutput(rawText: string): unknown {
  const text = rawText.trim();
  const candidates = [text];
  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) candidates.push(fencedMatch[1].trim());
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1));
  }
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      const normalized = candidate
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/,\s*([}\]])/g, "$1");
      try {
        return JSON.parse(normalized);
      } catch {
        continue;
      }
    }
  }
  throw new Error("Unable to parse financial report JSON.");
}

function normalizeReportPayload(value: unknown): FinancialReportResult {
  const p = (value ?? {}) as Record<string, unknown>;
  const priorityRaw = Array.isArray(p.priorityActions) ? p.priorityActions : [];
  return {
    executiveSummary: safeStr(p.executiveSummary),
    nextPeriodFocus: normalizeFocus(p.nextPeriodFocus),
    nextPeriodFocusReason: safeStr(p.nextPeriodFocusReason),
    predictedNextSteps: safeArr(p.predictedNextSteps),
    emailMarketingActions: safeArr(p.emailMarketingActions),
    contentPlatformActions: safeArr(p.contentPlatformActions),
    priorityActions: priorityRaw.map((a) => ({
      action: safeStr((a as Record<string, unknown>)?.action),
      channel: safeStr((a as Record<string, unknown>)?.channel),
      impact: safeStr((a as Record<string, unknown>)?.impact),
      timeframe: safeStr((a as Record<string, unknown>)?.timeframe),
    })),
    revenueTrend: safeStr(p.revenueTrend),
    marketingEfficiencyNote: safeStr(p.marketingEfficiencyNote),
    risks: safeArr(p.risks),
  };
}

function safeStr(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "—";
}

function safeArr(v: unknown): string[] {
  if (Array.isArray(v)) {
    const out = v.map((x) => (typeof x === "string" ? x.trim() : String(x))).filter(Boolean);
    if (out.length) return out;
  }
  if (typeof v === "string" && v.trim()) {
    return v.split(/\n|;|•/g).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeFocus(v: unknown): FinancialReportResult["nextPeriodFocus"] {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("email")) return "email_marketing";
  if (s.includes("content") || s.includes("social")) return "content_social";
  if (s.includes("experiment")) return "experiment";
  return "balanced";
}
