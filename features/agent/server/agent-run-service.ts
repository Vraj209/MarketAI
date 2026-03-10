import { OrchestratorResult } from "@/lib/ai/orchestration/types";
import { AgentRunRepository } from "@/server/repositories/agent-run-repository";
import { PrismaAgentRunRepository } from "@/server/repositories/prisma-agent-run-repository";

const defaultRepository: AgentRunRepository = new PrismaAgentRunRepository();

export class AgentRunService {
  constructor(private readonly repository: AgentRunRepository = defaultRepository) {}

  async saveSuccessfulRun(
    workspaceId: string,
    prompt: string,
    result: OrchestratorResult,
  ): Promise<void> {
    await this.repository.create({
      workspaceId,
      businessProfileId: result.context.businessProfile?.id,
      intent: result.intent,
      input: prompt,
      outputJson: JSON.stringify(result.response),
      status: "success",
      traceId: result.traceId,
    });
  }
}
