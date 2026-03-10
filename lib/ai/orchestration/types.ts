import { BusinessProfile } from "@/features/business/types/business-profile";
import { MarketingIntent, StrategyOutput } from "@/lib/ai/schemas/strategy-output";

export type StrategistRequest = {
  workspaceId: string;
  prompt: string;
};

export type AssembledContext = {
  businessProfile: BusinessProfile | null;
  normalizedPrompt: string;
};

export type ToolExecutionResult = {
  toolName: string;
  output: string;
};

export type OrchestratorResult = {
  intent: MarketingIntent;
  traceId: string;
  context: AssembledContext;
  toolOutputs: ToolExecutionResult[];
  response: StrategyOutput;
};
