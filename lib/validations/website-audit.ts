import { z } from "zod";

export const websiteAuditRequestSchema = z.object({
  websiteUrl: z.string().url().max(300),
  businessType: z.string().min(2).max(120).optional(),
  targetAudience: z.string().max(180).optional(),
});

export const websiteAuditIssueSchema = z.object({
  title: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  impact: z.string(),
  evidence: z.string(),
  recommendation: z.string(),
});

export const websiteAuditResultSchema = z.object({
  websiteUrl: z.string(),
  overview: z.string(),
  overallScore: z.number().min(0).max(100),
  seoScore: z.number().min(0).max(100),
  conversionScore: z.number().min(0).max(100),
  visualScore: z.number().min(0).max(100),
  topStrengths: z.array(z.string()),
  topIssues: z.array(websiteAuditIssueSchema),
  quickWins: z.array(z.string()),
  strategicActions: z.array(z.string()),
  colorThemeAssessment: z.object({
    currentThemeSummary: z.string(),
    accessibilityNotes: z.string(),
    improvementIdeas: z.array(z.string()),
  }),
  seoRecommendations: z.array(z.string()),
  conversionRecommendations: z.array(z.string()),
});

export type WebsiteAuditRequest = z.infer<typeof websiteAuditRequestSchema>;
export type WebsiteAuditResult = z.infer<typeof websiteAuditResultSchema>;
