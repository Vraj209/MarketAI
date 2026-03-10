import { getOpenAIClient } from "@/lib/integrations/openai/client";
import {
  WebsiteAuditRequest,
  WebsiteAuditResult,
  websiteAuditResultSchema,
} from "@/lib/validations/website-audit";

export type WebsiteAuditTimingsMs = {
  fetchWebsiteMs: number;
  heuristicMs: number;
  aiAnalysisMs: number;
  normalizationMs: number;
  totalMs: number;
};

export type WebsiteAuditWorkflowResult = {
  audit: WebsiteAuditResult;
  timingsMs: WebsiteAuditTimingsMs;
  stepOutputs: WebsiteAuditStepOutputs;
};

export type WebsiteAuditStepOutputs = {
  fetchWebsite: {
    url: string;
    htmlLength: number;
    snapshotPreview: string;
  };
  heuristicAnalysis: Record<string, unknown>;
  aiAgentOutput: {
    model: string;
    rawOutputPreview: string;
  };
  normalization: {
    overallScore: number;
    seoScore: number;
    conversionScore: number;
    visualScore: number;
    issueCount: number;
    quickWinsCount: number;
    strategicActionsCount: number;
  };
};

export async function runWebsiteAudit(input: WebsiteAuditRequest): Promise<WebsiteAuditWorkflowResult> {
  const totalStart = Date.now();

  const fetchStart = Date.now();
  const html = await fetchWebsiteHtml(input.websiteUrl);
  const fetchWebsiteMs = Date.now() - fetchStart;

  const heuristicStart = Date.now();
  const snapshot = extractWebsiteSnapshot(html);
  const heuristics = buildHeuristicSignals(html);
  const heuristicMs = Date.now() - heuristicStart;

  const aiStart = Date.now();
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          "You are a senior CRO + SEO + UI audit specialist. Return strict JSON only. Be specific, actionable, and non-generic.",
      },
      {
        role: "user",
        content: [
          "Audit this business website for SEO, conversion quality, and visual/theme quality.",
          `Website URL: ${input.websiteUrl}`,
          `Business type: ${input.businessType ?? "not provided"}`,
          `Target audience: ${input.targetAudience ?? "not provided"}`,
          `HTML snapshot: ${snapshot}`,
          `Heuristic signals: ${JSON.stringify(heuristics)}`,
          "Return fields exactly: websiteUrl, overview, overallScore, seoScore, conversionScore, visualScore, topStrengths[], topIssues[{title,severity,impact,evidence,recommendation}], quickWins[], strategicActions[], colorThemeAssessment{currentThemeSummary,accessibilityNotes,improvementIdeas[]}, seoRecommendations[], conversionRecommendations[].",
        ].join("\n"),
      },
    ],
  });
  const aiAnalysisMs = Date.now() - aiStart;

  const normalizationStart = Date.now();
  const parsed = parseJsonFromModelOutput(response.output_text);
  const audit = websiteAuditResultSchema.parse(normalizeAuditPayload(parsed, input.websiteUrl));
  const normalizationMs = Date.now() - normalizationStart;
  const totalMs = Date.now() - totalStart;

  return {
    audit,
    timingsMs: {
      fetchWebsiteMs,
      heuristicMs,
      aiAnalysisMs,
      normalizationMs,
      totalMs,
    },
    stepOutputs: {
      fetchWebsite: {
        url: input.websiteUrl,
        htmlLength: html.length,
        snapshotPreview: snapshot.slice(0, 1200),
      },
      heuristicAnalysis: heuristics,
      aiAgentOutput: {
        model: "gpt-4.1",
        rawOutputPreview: response.output_text.slice(0, 2000),
      },
      normalization: {
        overallScore: audit.overallScore,
        seoScore: audit.seoScore,
        conversionScore: audit.conversionScore,
        visualScore: audit.visualScore,
        issueCount: audit.topIssues.length,
        quickWinsCount: audit.quickWins.length,
        strategicActionsCount: audit.strategicActions.length,
      },
    },
  };
}

async function fetchWebsiteHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    method: "GET",
    signal: AbortSignal.timeout(12000),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MarketAI-Audit/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Website fetch failed with status ${response.status}`);
  }

  return response.text();
}

function extractWebsiteSnapshot(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

function buildHeuristicSignals(html: string): Record<string, unknown> {
  const normalized = html.toLowerCase();
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = firstMatch(
    html,
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  const h1Count = (normalized.match(/<h1[\s>]/g) ?? []).length;
  const imageCount = (normalized.match(/<img[\s>]/g) ?? []).length;
  const altCount = (normalized.match(/<img[^>]*alt=/g) ?? []).length;
  const hasSchemaOrg = normalized.includes("application/ld+json");
  const hasCanonical = normalized.includes("rel=\"canonical\"") || normalized.includes("rel='canonical'");
  const ctaSignals = ["book", "buy", "get started", "contact", "start free", "schedule"].filter(
    (signal) => normalized.includes(signal),
  );
  const colorMentions = normalized.match(/#[0-9a-f]{3,8}/g) ?? [];

  return {
    titleLength: title?.length ?? 0,
    hasMetaDescription: Boolean(description),
    metaDescriptionLength: description?.length ?? 0,
    h1Count,
    imageCount,
    imageAltCoverage: imageCount ? Number((altCount / imageCount).toFixed(2)) : 0,
    hasSchemaOrg,
    hasCanonical,
    ctaSignalCount: ctaSignals.length,
    detectedHexColors: [...new Set(colorMentions)].slice(0, 10),
  };
}

function firstMatch(content: string, regex: RegExp): string | null {
  const match = content.match(regex);
  if (!match?.[1]) {
    return null;
  }
  return match[1].trim();
}

function parseJsonFromModelOutput(rawText: string): unknown {
  const text = rawText.trim();
  const candidates = [text];

  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1].trim());
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(text.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  throw new Error("Unable to parse website audit JSON output.");
}

function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    const normalized = value
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }
}

function normalizeAuditPayload(value: unknown, websiteUrl: string): WebsiteAuditResult {
  const payload = (value ?? {}) as Record<string, unknown>;
  const topIssuesRaw = Array.isArray(payload.topIssues) ? payload.topIssues : [];

  return {
    websiteUrl,
    overview: safeText(payload.overview),
    overallScore: clampScore(payload.overallScore),
    seoScore: clampScore(payload.seoScore),
    conversionScore: clampScore(payload.conversionScore),
    visualScore: clampScore(payload.visualScore),
    topStrengths: safeStringArray(payload.topStrengths),
    topIssues: topIssuesRaw.map((issue) => normalizeIssue(issue)),
    quickWins: safeStringArray(payload.quickWins),
    strategicActions: safeStringArray(payload.strategicActions),
    colorThemeAssessment: {
      currentThemeSummary: safeText(
        readObjectField(payload.colorThemeAssessment, "currentThemeSummary"),
      ),
      accessibilityNotes: safeText(
        readObjectField(payload.colorThemeAssessment, "accessibilityNotes"),
      ),
      improvementIdeas: safeStringArray(
        readObjectField(payload.colorThemeAssessment, "improvementIdeas"),
      ),
    },
    seoRecommendations: safeStringArray(payload.seoRecommendations),
    conversionRecommendations: safeStringArray(payload.conversionRecommendations),
  };
}

function normalizeIssue(issue: unknown) {
  return {
    title: safeText(readObjectField(issue, "title")),
    severity: normalizeSeverity(readObjectField(issue, "severity")),
    impact: safeText(readObjectField(issue, "impact")),
    evidence: safeText(readObjectField(issue, "evidence")),
    recommendation: safeText(readObjectField(issue, "recommendation")),
  };
}

function normalizeSeverity(value: unknown): "high" | "medium" | "low" {
  const text = safeText(value).toLowerCase();
  if (text.includes("high")) return "high";
  if (text.includes("low")) return "low";
  return "medium";
}

function readObjectField(value: unknown, key: string): unknown {
  if (value && typeof value === "object") {
    return (value as Record<string, unknown>)[key];
  }
  return undefined;
}

function safeText(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object") return JSON.stringify(value).slice(0, 280);
  return "Not enough signal from the current website snapshot.";
}

function safeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    const items = value.map((entry) => safeText(entry)).filter((entry) => entry.length > 0);
    if (items.length) return items;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|;|•|-/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.min(100, Math.round(numeric)));
  }
  return 55;
}
