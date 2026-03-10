import { NextResponse } from "next/server";

import { AgentRunService } from "@/features/agent/server/agent-run-service";
import { runMarketingStrategist } from "@/lib/ai/orchestration/marketing-strategist-orchestrator";
import { getSession } from "@/lib/auth/session";
import { strategistRequestSchema } from "@/lib/validations/strategist";

const agentRunService = new AgentRunService();

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = strategistRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await runMarketingStrategist({
    workspaceId: session.workspaceId,
    prompt: parsed.data.prompt,
  });

  await agentRunService.saveSuccessfulRun(
    session.workspaceId,
    parsed.data.prompt,
    result,
  );

  return NextResponse.json({
    data: result.response,
    meta: {
      intent: result.intent,
      traceId: result.traceId,
      toolOutputs: result.toolOutputs,
    },
  });
}
