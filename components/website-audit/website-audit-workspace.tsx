"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Palette, Search, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type WebsiteAuditResult = {
  websiteUrl: string;
  overview: string;
  overallScore: number;
  seoScore: number;
  conversionScore: number;
  visualScore: number;
  topStrengths: string[];
  topIssues: Array<{
    title: string;
    severity: "high" | "medium" | "low";
    impact: string;
    evidence: string;
    recommendation: string;
  }>;
  quickWins: string[];
  strategicActions: string[];
  colorThemeAssessment: {
    currentThemeSummary: string;
    accessibilityNotes: string;
    improvementIdeas: string[];
  };
  seoRecommendations: string[];
  conversionRecommendations: string[];
};

type WebsiteAuditTimingsMs = {
  fetchWebsiteMs: number;
  heuristicMs: number;
  aiAnalysisMs: number;
  normalizationMs: number;
  totalMs: number;
};

type WebsiteAuditStepOutputs = {
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

const PROCESS_STEPS: Array<{
  id: "fetchWebsite" | "heuristicAnalysis" | "aiAgentOutput" | "normalization";
  timingKey: keyof WebsiteAuditTimingsMs;
  label: string;
}> = [
  { id: "fetchWebsite", timingKey: "fetchWebsiteMs", label: "Fetching website HTML" },
  {
    id: "heuristicAnalysis",
    timingKey: "heuristicMs",
    label: "Analyzing SEO, conversion, and theme signals",
  },
  { id: "aiAgentOutput", timingKey: "aiAnalysisMs", label: "Running website audit agent" },
  { id: "normalization", timingKey: "normalizationMs", label: "Formatting recommendations and action plan" },
];

export function WebsiteAuditWorkspace() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<WebsiteAuditResult | null>(null);
  const [timings, setTimings] = useState<WebsiteAuditTimingsMs | null>(null);
  const [stepOutputs, setStepOutputs] = useState<WebsiteAuditStepOutputs | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedStepId, setSelectedStepId] = useState<(typeof PROCESS_STEPS)[number]["id"]>(
    "fetchWebsite",
  );
  const runStartedAtRef = useRef<number>(0);
  const previewUrl = useMemo(() => normalizePreviewUrl(websiteUrl), [websiteUrl]);

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const elapsedTimer = setInterval(() => {
      setElapsedMs(Date.now() - runStartedAtRef.current);
    }, 250);

    const stepTimer = setInterval(() => {
      setCurrentStepIndex((previous) => Math.min(previous + 1, PROCESS_STEPS.length - 1));
    }, 3200);

    return () => {
      clearInterval(elapsedTimer);
      clearInterval(stepTimer);
    };
  }, [status]);

  const runAudit = async () => {
    runStartedAtRef.current = Date.now();
    setElapsedMs(0);
    setCurrentStepIndex(0);
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    setTimings(null);
    setStepOutputs(null);

    const response = await fetch("/api/website-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteUrl, businessType, targetAudience }),
    });

    if (!response.ok) {
      let message = "Unable to run website audit.";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) {
          message = payload.error;
        }
      } catch {
        // use default
      }
      setErrorMessage(message);
      setStatus("error");
      return;
    }

    const payload = (await response.json()) as {
      data: WebsiteAuditResult;
      meta?: { timingsMs?: WebsiteAuditTimingsMs; stepOutputs?: WebsiteAuditStepOutputs };
    };
    setResult(payload.data);
    setTimings(payload.meta?.timingsMs ?? null);
    setStepOutputs(payload.meta?.stepOutputs ?? null);
    setCurrentStepIndex(PROCESS_STEPS.length - 1);
    setElapsedMs(Date.now() - runStartedAtRef.current);
    setStatus("idle");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website audit agent</CardTitle>
          <CardDescription>
            Enter your website and get a high-signal audit for SEO, conversion, visual quality,
            and prioritized actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Website URL">
            <Input
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://yourbusiness.com"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business type (optional)">
              <Input
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                placeholder="Dental clinic, cafe, salon"
              />
            </Field>
            <Field label="Target audience (optional)">
              <Input
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                placeholder="Young families in downtown"
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={runAudit}
              disabled={status === "loading" || websiteUrl.trim().length < 10}
            >
              {status === "loading" ? "Auditing website..." : "Run website audit"}
            </Button>
            {status === "error" ? (
              <p className="text-sm text-[var(--error)]">
                {errorMessage ?? "Unable to run website audit."}
              </p>
            ) : null}
          </div>

          {(previewUrl || status === "loading" || timings) ? (
            <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
              {previewUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                      Website preview
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--accent)] underline underline-offset-2"
                    >
                      Open in new tab
                    </a>
                  </div>
                  <iframe
                    key={previewUrl}
                    src={previewUrl}
                    title="Website preview"
                    className="h-[360px] w-full rounded-lg border border-[var(--border)] bg-[var(--background)]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Some websites block iframe embedding. If preview is blocked, use Open in new tab.
                  </p>
                </div>
              ) : null}

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
                        : "Ready to run"}
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
            <CardTitle>Audit overview</CardTitle>
            <CardDescription>{result.websiteUrl}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--foreground)]">
            <div className="grid gap-3 md:grid-cols-4">
              <ScoreCard label="Overall" score={result.overallScore} icon={<TrendingUp />} />
              <ScoreCard label="SEO" score={result.seoScore} icon={<Search />} />
              <ScoreCard label="Conversion" score={result.conversionScore} icon={<CheckCircle2 />} />
              <ScoreCard label="Visual" score={result.visualScore} icon={<Palette />} />
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
              <Panel label="Executive overview">{result.overview}</Panel>
              <IssueSeverityCard issues={result.topIssues} />
            </div>

            <ListPanel label="Top strengths" items={result.topStrengths} />

            <div className="grid gap-3 md:grid-cols-2">
              <ListPanel label="Quick wins (high impact, low effort)" items={result.quickWins} />
              <NumberedListPanel
                label="Strategic actions roadmap"
                items={result.strategicActions}
              />
            </div>

            <Panel label="Color theme assessment">
              <p>{result.colorThemeAssessment.currentThemeSummary}</p>
              <p className="mt-2 text-[var(--muted-foreground)]">
                {result.colorThemeAssessment.accessibilityNotes}
              </p>
              <ul className="mt-2 space-y-1">
                {result.colorThemeAssessment.improvementIdeas.map((item) => (
                  <li key={item} className="rounded-md bg-[var(--background)] px-2 py-1">
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="grid gap-3 md:grid-cols-2">
              <ListPanel label="SEO recommendations" items={result.seoRecommendations} />
              <ListPanel label="Conversion recommendations" items={result.conversionRecommendations} />
            </div>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Priority issue list
              </h3>
              <div className="space-y-2">
                {result.topIssues.map((issue) => (
                  <div
                    key={`${issue.title}-${issue.evidence}`}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-semibold">{issue.title}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          issue.severity === "high" && "bg-[var(--error)]/15 text-[var(--error)]",
                          issue.severity === "medium" &&
                            "bg-[var(--warning)]/15 text-[var(--warning)]",
                          issue.severity === "low" && "bg-[var(--success)]/15 text-[var(--success)]",
                        )}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p>
                      <strong>Impact:</strong> {issue.impact}
                    </p>
                    <p>
                      <strong>Evidence:</strong> {issue.evidence}
                    </p>
                    <p>
                      <strong>Action:</strong> {issue.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
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

function ScoreCard({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const tone = getScoreTone(score);
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/16 p-3 shadow-sm">
      <p className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            tone === "good" && "bg-[var(--success)]/15 text-[var(--success)]",
            tone === "average" && "bg-[var(--warning)]/15 text-[var(--warning)]",
            tone === "poor" && "bg-[var(--error)]/15 text-[var(--error)]",
          )}
        >
          {tone}
        </span>
      </p>
      <p className="mb-2 text-2xl font-semibold">{score}</p>
      <div className="h-2 rounded-full bg-[var(--background)]">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            tone === "good" && "bg-[var(--success)]",
            tone === "average" && "bg-[var(--warning)]",
            tone === "poor" && "bg-[var(--error)]",
          )}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}

function IssueSeverityCard({
  issues,
}: {
  issues: Array<{ severity: "high" | "medium" | "low" }>;
}) {
  const high = issues.filter((issue) => issue.severity === "high").length;
  const medium = issues.filter((issue) => issue.severity === "medium").length;
  const low = issues.filter((issue) => issue.severity === "low").length;
  const total = Math.max(1, issues.length);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        Issue severity distribution
      </p>
      <div className="space-y-2">
        <SeverityBar label="High" value={high} total={total} tone="high" />
        <SeverityBar label="Medium" value={medium} total={total} tone="medium" />
        <SeverityBar label="Low" value={low} total={total} tone="low" />
      </div>
    </section>
  );
}

function SeverityBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "high" | "medium" | "low";
}) {
  const width = (value / total) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-[var(--muted-foreground)]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--background)]">
        <div
          className={cn(
            "h-2 rounded-full",
            tone === "high" && "bg-[var(--error)]",
            tone === "medium" && "bg-[var(--warning)]",
            tone === "low" && "bg-[var(--success)]",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function NumberedListPanel({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item} className="flex gap-2 rounded-md bg-[var(--background)] px-2 py-1.5">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function getScoreTone(score: number): "good" | "average" | "poor" {
  if (score >= 75) return "good";
  if (score >= 50) return "average";
  return "poor";
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

function ListPanel({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-[var(--background)] px-2 py-1">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function normalizePreviewUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.toString();
  } catch {
    return null;
  }
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
    return <p className="text-xs text-[var(--muted-foreground)]">Running step... output will appear here.</p>;
  }

  if (!output) {
    return <p className="text-xs text-[var(--muted-foreground)]">No output captured for this step yet.</p>;
  }

  if (stepId === "fetchWebsite" && typeof output === "object" && output) {
    const data = output as { url?: string; htmlLength?: number; snapshotPreview?: string };
    return (
      <div className="space-y-1 text-xs">
        <p>
          <strong>URL:</strong> {data.url}
        </p>
        <p>
          <strong>HTML size:</strong> {data.htmlLength ?? 0} chars
        </p>
        <p className="text-[var(--muted-foreground)]">{data.snapshotPreview?.slice(0, 320)}</p>
      </div>
    );
  }

  if (stepId === "aiAgentOutput" && typeof output === "object" && output) {
    const data = output as { model?: string; rawOutputPreview?: string };
    return (
      <div className="space-y-1 text-xs">
        <p>
          <strong>Model:</strong> {data.model}
        </p>
        <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded bg-[var(--surface)] p-2 text-[11px]">
          {data.rawOutputPreview}
        </pre>
      </div>
    );
  }

  return (
    <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[var(--surface)] p-2 text-[11px]">
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
