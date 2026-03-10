import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { financialReportRequestSchema } from "@/lib/validations/financial-report";
import { runFinancialReportWorkflow } from "@/server/workflows/financial-report-workflow";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = financialReportRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await runFinancialReportWorkflow(parsed.data);
    return NextResponse.json({
      data: result.result,
      meta: { timingsMs: result.timingsMs, stepOutputs: result.stepOutputs },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Financial report analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
