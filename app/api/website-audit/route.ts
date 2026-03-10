import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { websiteAuditRequestSchema } from "@/lib/validations/website-audit";
import { runWebsiteAudit } from "@/server/workflows/website-audit-workflow";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = websiteAuditRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await runWebsiteAudit(parsed.data);
    return NextResponse.json({
      data: result.audit,
      meta: { timingsMs: result.timingsMs, stepOutputs: result.stepOutputs },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Website audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
