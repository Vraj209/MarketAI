import { Activity, BarChart3, FileText, Mail, Sparkles, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const metricCards = [
  { label: "Campaigns", value: "0", icon: Target },
  { label: "Assets Generated", value: "0", icon: FileText },
  { label: "Active Channels", value: "0", icon: BarChart3 },
];

const pipelineAgents = [
  {
    name: "Strategist Agent",
    status: "running",
    detail: "Analyzing business context and campaign opportunities",
    progress: 68,
    time: "now",
    icon: Sparkles,
  },
  {
    name: "Social Content Agent",
    status: "running",
    detail: "Generating Instagram carousel for spring promo",
    progress: 44,
    time: "now",
    icon: Activity,
  },
  {
    name: "Email Agent",
    status: "queued",
    detail: "Waiting to draft retention email sequence",
    progress: 0,
    time: "queued",
    icon: Mail,
  },
  {
    name: "Newsletter Agent",
    status: "idle",
    detail: "Ready to generate weekly digest",
    progress: 0,
    time: "2 hours ago",
    icon: FileText,
  },
  {
    name: "Website Audit Agent",
    status: "done",
    detail: "Audit complete - 12 recommendations found",
    progress: 100,
    time: "30 min ago",
    icon: BarChart3,
  },
] as const;

export function AgentWorkspace() {
  const runningCount = pipelineAgents.filter((agent) => agent.status === "running").length;
  const queuedCount = pipelineAgents.filter((agent) => agent.status === "queued").length;

  return (
    <div className="space-y-6">
      <section>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          Overview
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Your AI-powered marketing operating system
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="rounded-xl">
              <CardContent className="p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  <Icon className="h-3 w-3" />
                  {metric.label}
                </p>
                <p className="text-4xl font-semibold leading-none text-[var(--foreground)]">{metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Agent pipeline
          </p>
          <div className="flex items-center gap-4 text-xs">
            <p className="text-[var(--success)]">{runningCount} running</p>
            <p className="text-[var(--warning)]">{queuedCount} queued</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {pipelineAgents.map((agent) => {
            const Icon = agent.icon;
            const isRunning = agent.status === "running";

            return (
              <article
                key={agent.name}
                className={cn(
                  "rounded-xl border border-[var(--border)] px-4 py-3",
                  isRunning ? "bg-[var(--accent-soft)]/18" : "bg-[var(--surface)]",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-content-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
                      <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[var(--foreground)]">{agent.name}</p>
                        <StatusPill status={agent.status} />
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">{agent.detail}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs text-[var(--muted-foreground)]">{agent.time}</p>
                </div>

                {agent.progress > 0 ? (
                  <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--accent-soft)]/45">
                    <div
                      className="h-1.5 rounded-full bg-[var(--success)] transition-all"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: "running" | "queued" | "idle" | "done" }) {
  const label = status.toUpperCase();

  if (status === "running") {
    return <Badge className="bg-[var(--success)]/15 text-[var(--success)]">{label}</Badge>;
  }
  if (status === "queued") {
    return <Badge className="bg-[var(--warning)]/15 text-[var(--warning)]">{label}</Badge>;
  }
  if (status === "done") {
    return <Badge className="bg-[var(--accent-soft)]/50 text-[var(--foreground)]">{label}</Badge>;
  }
  return <Badge className="bg-[var(--accent-soft)]/28 text-[var(--muted-foreground)]">{label}</Badge>;
}
