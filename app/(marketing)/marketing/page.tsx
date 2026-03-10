import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingHomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <section className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Marketing Agent MVP
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            AI marketing strategy with structured, decision-ready outputs.
          </h1>
          <p className="max-w-2xl text-base text-[var(--muted-foreground)]">
            Build campaigns, content, and reports from one strategist workflow. Designed for clarity, trust, and fast execution.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>MVP foundation</CardTitle>
            <CardDescription>
              Includes app shell, auth, onboarding, dashboard, strategist, and deterministic agent orchestration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <p>- App router shell with consistent layout patterns</p>
            <p>- Auth.js credentials baseline and protected app routes</p>
            <p>- Business onboarding with strict validation</p>
            <p>- API-first strategist request lifecycle</p>
            <p>- Prisma schema for business, assets, campaigns, and agent runs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
