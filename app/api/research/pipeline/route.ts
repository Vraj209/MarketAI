import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { researchPipelineRequestSchema } from "@/lib/validations/research-pipeline";
import { runResearchPipeline } from "@/server/workflows/research-pipeline-workflow";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = researchPipelineRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await runResearchPipeline(parsed.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
