import { z } from "zod";

export const financialPeriodSchema = z.object({
  label: z.string().min(1).max(80),
  revenue: z.number().min(0),
  expenses: z.number().min(0),
  marketingSpend: z.number().min(0).optional(),
  emailRevenue: z.number().min(0).optional(),
  contentOrSocialRevenue: z.number().min(0).optional(),
  notes: z.string().max(300).optional(),
});

export const financialReportRequestSchema = z.object({
  periodType: z.enum(["monthly", "quarterly", "annual"]),
  businessName: z.string().min(1).max(120).optional(),
  periods: z.array(financialPeriodSchema).min(1).max(24),
  goals: z.string().max(500).optional(),
});

export const financialReportResultSchema = z.object({
  executiveSummary: z.string(),
  nextPeriodFocus: z.enum(["email_marketing", "content_social", "balanced", "experiment"]),
  nextPeriodFocusReason: z.string(),
  predictedNextSteps: z.array(z.string()),
  emailMarketingActions: z.array(z.string()),
  contentPlatformActions: z.array(z.string()),
  priorityActions: z.array(
    z.object({
      action: z.string(),
      channel: z.string(),
      impact: z.string(),
      timeframe: z.string(),
    }),
  ),
  revenueTrend: z.string(),
  marketingEfficiencyNote: z.string(),
  risks: z.array(z.string()),
});

export type FinancialPeriod = z.infer<typeof financialPeriodSchema>;
export type FinancialReportRequest = z.infer<typeof financialReportRequestSchema>;
export type FinancialReportResult = z.infer<typeof financialReportResultSchema>;
