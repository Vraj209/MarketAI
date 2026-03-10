import { getPrismaClient } from "@/lib/db/prisma";
import {
  AgentRunRepository,
  CreateAgentRunInput,
} from "@/server/repositories/agent-run-repository";

export class PrismaAgentRunRepository implements AgentRunRepository {
  async create(input: CreateAgentRunInput): Promise<void> {
    const prisma = getPrismaClient();

    await prisma.workspace.upsert({
      where: { id: input.workspaceId },
      update: {},
      create: {
        id: input.workspaceId,
        name: "Default Workspace",
        slug: input.workspaceId,
      },
    });

    await prisma.agentRun.create({
      data: {
        workspaceId: input.workspaceId,
        businessProfileId: input.businessProfileId,
        intent: input.intent,
        input: input.input,
        outputJson: input.outputJson,
        status: input.status,
        traceId: input.traceId,
      },
    });
  }
}
