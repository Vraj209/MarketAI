"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  FileUp,
  Mail,
  Megaphone,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

import type { FinancialPeriod } from "@/lib/validations/financial-report";

type FinancialReportResult = {
  executiveSummary: string;
  nextPeriodFocus: "email_marketing" | "content_social" | "balanced" | "experiment";
  nextPeriodFocusReason: string;
  predictedNextSteps: string[];
  emailMarketingActions: string[];
  contentPlatformActions: string[];
  priorityActions: Array<{
    action: string;
    channel: string;
    impact: string;
    timeframe: string;
  }>;
  revenueTrend: string;
  marketingEfficiencyNote: string;
  risks: string[];
};

type FinancialReportTimingsMs = {
  parseInputMs: number;
  aiAnalysisMs: number;
  normalizationMs: number;
  totalMs: number;
};

type FinancialReportStepOutputs = {
  parseInput: {
    periodType: string;
    periodCount: number;
    totalRevenue: number;
    totalExpenses: number;
    totalMarketingSpend: number;
  };
  aiAnalysis: { model: string; rawOutputPreview: string };
  normalization: { nextPeriodFocus: string; actionCount: number; priorityCount: number };
};

const PROCESS_STEPS: Array<{
  id: "parseInput" | "aiAnalysis" | "normalization";
  timingKey: keyof FinancialReportTimingsMs;
  label: string;
}> = [
  { id: "parseInput", timingKey: "parseInputMs", label: "Parsing financial data" },
  { id: "aiAnalysis", timingKey: "aiAnalysisMs", label: "Running financial analysis agent" },
  { id: "normalization", timingKey: "normalizationMs", label: "Formatting recommendations" },
];

const DEFAULT_PERIOD: FinancialPeriod = {
  label: "",
  revenue: 0,
  expenses: 0,
  marketingSpend: 0,
};

export function FinancialReportWorkspace() {
  const [periodType, setPeriodType] = useState<"monthly" | "quarterly" | "annual">("quarterly");
  const [businessName, setBusinessName] = useState("");
  const [goals, setGoals] = useState("");
  const [periods, setPeriods] = useState<FinancialPeriod[]>([
    { ...DEFAULT_PERIOD, label: "Q1", revenue: 120000, expenses: 85000, marketingSpend: 8000 },
    { ...DEFAULT_PERIOD, label: "Q2", revenue: 145000, expenses: 92000, marketingSpend: 10000 },
    { ...DEFAULT_PERIOD, label: "Q3", revenue: 132000, expenses: 88000, marketingSpend: 9500 },
  ]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<FinancialReportResult | null>(null);
  const [timings, setTimings] = useState<FinancialReportTimingsMs | null>(null);
  const [stepOutputs, setStepOutputs] = useState<FinancialReportStepOutputs | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedStepId, setSelectedStepId] = useState<(typeof PROCESS_STEPS)[number]["id"]>(
    "parseInput",
  );
  const [pdfParseStatus, setPdfParseStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pdfParseError, setPdfParseError] = useState<string | null>(null);
  const runStartedAtRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "loading") return;
    const t = setInterval(() => setElapsedMs(Date.now() - runStartedAtRef.current), 250);
    const s = setInterval(
      () => setCurrentStepIndex((i) => Math.min(i + 1, PROCESS_STEPS.length - 1)),
      2800,
    );
    return () => {
      clearInterval(t);
      clearInterval(s);
    };
  }, [status]);

  const addPeriod = () => {
    setPeriods((p) => [...p, { ...DEFAULT_PERIOD, label: `Period ${p.length + 1}` }]);
  };

  const updatePeriod = (index: number, field: keyof FinancialPeriod, value: string | number) => {
    setPeriods((p) => {
      const next = [...p];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 1) return;
    setPeriods((p) => p.filter((_, i) => i !== index));
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || file.type !== "application/pdf") {
      setPdfParseError("Please select a PDF file.");
      setPdfParseStatus("error");
      return;
    }
    setPdfParseError(null);
    setPdfParseStatus("loading");
    const formData = new FormData();
    formData.set("file", file);
    try {
      const response = await fetch("/api/reports/financial/parse-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setPdfParseError(data?.error ?? "Failed to extract data from PDF.");
        setPdfParseStatus("error");
        return;
      }
      const { periodType: inferredType, periods: extracted } = data as {
        periodType?: "monthly" | "quarterly" | "annual";
        periods?: FinancialPeriod[];
      };
      if (Array.isArray(extracted) && extracted.length > 0) {
        setPeriods(extracted);
        if (inferredType) setPeriodType(inferredType);
        setPdfParseStatus("success");
      } else {
        setPdfParseError("No financial periods found in the PDF.");
        setPdfParseStatus("error");
      }
    } catch {
      setPdfParseError("Upload failed. Please try again.");
      setPdfParseStatus("error");
    }
  };

  const runAnalysis = async () => {
    const payload = {
      periodType,
      businessName: businessName.trim() || undefined,
      goals: goals.trim() || undefined,
      periods: periods.map((p) => ({
        label: p.label.trim() || "Period",
        revenue: Number(p.revenue) || 0,
        expenses: Number(p.expenses) || 0,
        marketingSpend: Number(p.marketingSpend) ?? 0,
      })),
    };

    runStartedAtRef.current = Date.now();
    setElapsedMs(0);
    setCurrentStepIndex(0);
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    setTimings(null);
    setStepOutputs(null);

    const response = await fetch("/api/reports/financial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let msg = "Unable to run financial report analysis.";
      try {
        const data = (await response.json()) as { error?: string };
        if (data.error) msg = data.error;
      } catch {
        // ignore
      }
      setErrorMessage(msg);
      setStatus("error");
      return;
    }

    const data = (await response.json()) as {
      data: FinancialReportResult;
      meta?: { timingsMs?: FinancialReportTimingsMs; stepOutputs?: FinancialReportStepOutputs };
    };
    setResult(data.data);
    setTimings(data.meta?.timingsMs ?? null);
    setStepOutputs(data.meta?.stepOutputs ?? null);
    setCurrentStepIndex(PROCESS_STEPS.length - 1);
    setElapsedMs(Date.now() - runStartedAtRef.current);
    setStatus("idle");
  };

  const canRun =
    periods.length >= 1 &&
    periods.every((p) => (p.label?.trim?.()?.length ?? 0) > 0 && (Number(p.revenue) >= 0 || Number(p.expenses) >= 0));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial statements</CardTitle>
          <CardDescription>
            Add quarterly, monthly, or annual figures. The AI will evaluate performance and recommend next-quarter or next-month focus (email vs content) with actionable steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Report type">
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as "monthly" | "quarterly" | "annual")}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </Field>
            <Field label="Business name (optional)">
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Inc."
              />
            </Field>
          </div>
          <Field label="Goals or context (optional)">
            <Input
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Grow email list, increase social engagement"
            />
          </Field>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Or upload a financial statement (PDF)
            </p>
            <p className="mb-2 text-sm text-[var(--muted-foreground)]">
              We’ll extract period labels and numbers (revenue, expenses, marketing spend) and fill the table below.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
              aria-label="Upload PDF"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={pdfParseStatus === "loading"}
              >
                <FileUp className="mr-2 h-4 w-4" />
                {pdfParseStatus === "loading" ? "Extracting…" : "Choose PDF"}
              </Button>
              {pdfParseStatus === "success" && (
                <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                  <CheckCircle2 className="h-4 w-4" /> Data loaded from PDF
                </span>
              )}
              {pdfParseStatus === "error" && pdfParseError && (
                <span className="text-sm text-[var(--error)]">{pdfParseError}</span>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--foreground)]">Periods</label>
              <Button type="button" variant="ghost" size="sm" onClick={addPeriod}>
                <Plus className="mr-1 h-4 w-4" />
                Add period
              </Button>
            </div>
            {/* Column headers */}
            <div className="grid gap-2 rounded-t-lg border border-b-0 border-[var(--border)] bg-[var(--muted-foreground)]/8 px-2 py-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Period (e.g. Q1, Jan)
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Revenue ($)
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Expenses ($)
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Marketing spend ($)
              </span>
              <span className="w-10" aria-hidden />
            </div>
            <div className="space-y-0 rounded-b-lg border border-[var(--border)] bg-[var(--background)] p-3">
              {periods.map((p, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                >
                  <Input
                    placeholder="e.g. Q1, Jan"
                    value={p.label}
                    onChange={(e) => updatePeriod(i, "label", e.target.value)}
                    aria-label="Period label"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={p.revenue === 0 ? "" : p.revenue}
                    onChange={(e) => updatePeriod(i, "revenue", e.target.value ? Number(e.target.value) : 0)}
                    aria-label="Revenue"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={p.expenses === 0 ? "" : p.expenses}
                    onChange={(e) => updatePeriod(i, "expenses", e.target.value ? Number(e.target.value) : 0)}
                    aria-label="Expenses"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={p.marketingSpend === 0 ? "" : p.marketingSpend}
                    onChange={(e) =>
                      updatePeriod(i, "marketingSpend", e.target.value ? Number(e.target.value) : 0)
                    }
                    aria-label="Marketing spend"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePeriod(i)}
                    disabled={periods.length <= 1}
                    aria-label="Remove period"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={runAnalysis} disabled={status === "loading" || !canRun}>
              {status === "loading" ? "Analyzing..." : "Run financial analysis"}
            </Button>
            {status === "error" ? (
              <p className="text-sm text-[var(--error)]">{errorMessage ?? "Analysis failed."}</p>
            ) : null}
          </div>

          {(status === "loading" || timings || stepOutputs) ? (
            <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
              {/* Left: data summary + simple chart when we have result */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Your data summary
                </p>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {periodType} · {periods.length} period{periods.length !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    Total revenue:{" "}
                    <strong>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(periods.reduce((s, p) => s + (Number(p.revenue) || 0), 0))}
                    </strong>
                  </p>
                  <p className="text-sm">
                    Total expenses:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(periods.reduce((s, p) => s + (Number(p.expenses) || 0), 0))}
                  </p>
                  {result && periods.length > 0 ? (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                        Revenue by period
                      </p>
                      <div className="space-y-2">
                        {periods.map((p, i) => {
                          const rev = Number(p.revenue) || 0;
                          const max = Math.max(
                            ...periods.map((x) => Number(x.revenue) || 0),
                            1,
                          );
                          const w = (rev / max) * 100;
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-12 text-xs font-medium">{p.label}</span>
                              <div className="flex-1 h-5 rounded bg-[var(--background)]">
                                <div
                                  className="h-5 rounded bg-[var(--accent)]"
                                  style={{ width: `${w}%` }}
                                />
                              </div>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                }).format(rev)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right: agent status + step output */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    Agent processing status
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {status === "loading"
                      ? `Running: ${(elapsedMs / 1000).toFixed(1)}s`
                      : timings
                        ? `Completed: ${((timings.totalMs ?? elapsedMs) / 1000).toFixed(1)}s`
                        : "Ready"}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {PROCESS_STEPS.map((step, index) => {
                    const isCompleted =
                      status === "loading" ? index < currentStepIndex : Boolean(result);
                    const isRunning = status === "loading" && index === currentStepIndex;
                    const stepDurationMs = timings ? timings[step.timingKey] : null;
                    return (
                      <li
                        key={step.label}
                        className={cn(
                          "rounded-md border text-sm",
                          isCompleted && "border-[var(--success)]/40 bg-[var(--success)]/8",
                          isRunning && "border-[var(--accent)]/40 bg-[var(--accent-soft)]/22",
                          !isCompleted && !isRunning && "border-[var(--border)] bg-[var(--background)]",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedStepId(step.id)}
                          className={cn(
                            "flex w-full items-center justify-between px-2 py-1.5 text-left",
                            selectedStepId === step.id && "ring-1 ring-[var(--accent)]/40",
                          )}
                        >
                          <span>{step.label}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {isCompleted
                              ? stepDurationMs
                                ? `${(stepDurationMs / 1000).toFixed(1)}s`
                                : "done"
                              : isRunning
                                ? "running"
                                : "pending"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    Step output
                  </p>
                  <StepOutputDetail
                    stepId={selectedStepId}
                    status={status}
                    output={stepOutputs?.[selectedStepId]}
                  />
                </div>
              </div>
            </section>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Analysis overview</CardTitle>
            <CardDescription>AI evaluation and next-period recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--foreground)]">
            <div className="flex flex-wrap items-center gap-2">
              <FocusBadge focus={result.nextPeriodFocus} />
              <span className="text-[var(--muted-foreground)]">
                {result.nextPeriodFocusReason}
              </span>
            </div>

            <Panel label="Executive summary">{result.executiveSummary}</Panel>

            <div className="grid gap-3 md:grid-cols-2">
              <Panel label="Revenue trend">
                <p>{result.revenueTrend}</p>
              </Panel>
              <Panel label="Marketing efficiency">
                <p>{result.marketingEfficiencyNote}</p>
              </Panel>
            </div>

            <ListPanel label="Predicted next steps" items={result.predictedNextSteps} icon={<Sparkles />} />
            <div className="grid gap-3 md:grid-cols-2">
              <ListPanel
                label="Email marketing actions"
                items={result.emailMarketingActions}
                icon={<Mail />}
              />
              <ListPanel
                label="Content & platform actions"
                items={result.contentPlatformActions}
                icon={<Megaphone />}
              />
            </div>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                <TrendingUp className="h-4 w-4" />
                Priority actions
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="pb-2 pr-2 font-semibold">Action</th>
                      <th className="pb-2 pr-2 font-semibold">Channel</th>
                      <th className="pb-2 pr-2 font-semibold">Impact</th>
                      <th className="pb-2 font-semibold">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.priorityActions.map((pa, i) => (
                      <tr key={i} className="border-b border-[var(--border)]/60">
                        <td className="py-2 pr-2">{pa.action}</td>
                        <td className="py-2 pr-2">{pa.channel}</td>
                        <td className="py-2 pr-2 text-[var(--muted-foreground)]">{pa.impact}</td>
                        <td className="py-2">{pa.timeframe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {result.risks.length > 0 ? (
              <section className="rounded-lg border border-[var(--border)] bg-[var(--error)]/8 p-3">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--error)]">
                  Risks to watch
                </p>
                <ul className="space-y-1">
                  {result.risks.map((r) => (
                    <li key={r} className="flex gap-2 rounded-md bg-[var(--surface)] px-2 py-1">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">{label}</label>
      {children}
    </div>
  );
}

function FocusBadge({
  focus,
}: {
  focus: "email_marketing" | "content_social" | "balanced" | "experiment";
}) {
  const labels = {
    email_marketing: "Focus: Email marketing",
    content_social: "Focus: Content & social",
    balanced: "Focus: Balanced (email + content)",
    experiment: "Focus: Experiment & test",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase",
        focus === "email_marketing" && "bg-[var(--accent-soft)]/45 text-[var(--foreground)]",
        focus === "content_social" && "bg-[var(--badge)]/20 text-[var(--foreground)]",
        focus === "balanced" && "bg-[var(--success)]/15 text-[var(--foreground)]",
        focus === "experiment" && "bg-[var(--warning)]/15 text-[var(--foreground)]",
      )}
    >
      <BarChart3 className="h-3.5 w-3.5" />
      {labels[focus]}
    </span>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/14 p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <div className="space-y-1 leading-relaxed">{children}</div>
    </section>
  );
}

function ListPanel({
  label,
  items,
  icon,
}: {
  label: string;
  items: string[];
  icon?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {icon}
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 rounded-md bg-[var(--background)] px-2 py-1">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[10px] font-semibold">
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StepOutputDetail({
  stepId,
  status,
  output,
}: {
  stepId: (typeof PROCESS_STEPS)[number]["id"];
  status: "idle" | "loading" | "error";
  output: unknown;
}) {
  if (status === "loading" && !output) {
    return (
      <p className="text-xs text-[var(--muted-foreground)]">
        Running step… output will appear here.
      </p>
    );
  }
  if (!output) {
    return (
      <p className="text-xs text-[var(--muted-foreground)]">
        No output for this step yet.
      </p>
    );
  }
  if (stepId === "parseInput" && typeof output === "object" && output) {
    const d = output as FinancialReportStepOutputs["parseInput"];
    return (
      <div className="space-y-1 text-xs">
        <p>
          <strong>Period type:</strong> {d.periodType}
        </p>
        <p>
          <strong>Periods:</strong> {d.periodCount}
        </p>
        <p>
          <strong>Total revenue:</strong>{" "}
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(d.totalRevenue)}
        </p>
        <p>
          <strong>Total expenses:</strong>{" "}
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(d.totalExpenses)}
        </p>
        <p>
          <strong>Total marketing spend:</strong>{" "}
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(d.totalMarketingSpend)}
        </p>
      </div>
    );
  }
  if (stepId === "aiAnalysis" && typeof output === "object" && output) {
    const d = output as FinancialReportStepOutputs["aiAnalysis"];
    return (
      <div className="space-y-1 text-xs">
        <p>
          <strong>Model:</strong> {d.model}
        </p>
        <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded bg-[var(--surface)] p-2 text-[11px]">
          {d.rawOutputPreview}
        </pre>
      </div>
    );
  }
  if (stepId === "normalization" && typeof output === "object" && output) {
    const d = output as FinancialReportStepOutputs["normalization"];
    return (
      <div className="space-y-1 text-xs">
        <p>
          <strong>Next period focus:</strong> {d.nextPeriodFocus}
        </p>
        <p>
          <strong>Action count:</strong> {d.actionCount}
        </p>
        <p>
          <strong>Priority actions:</strong> {d.priorityCount}
        </p>
      </div>
    );
  }
  return (
    <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[var(--surface)] p-2 text-[11px]">
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
