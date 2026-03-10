export type CreateAgentRunInput = {
  workspaceId: string;
  businessProfileId?: string;
  intent: string;
  input: string;
  outputJson: string;
  status: "success" | "failed";
  traceId: string;
};

export interface AgentRunRepository {
  create(input: CreateAgentRunInput): Promise<void>;
}
