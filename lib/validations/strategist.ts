import { z } from "zod";

export const strategistRequestSchema = z.object({
  prompt: z.string().min(10).max(4000),
});

export type StrategistRequestInput = z.infer<typeof strategistRequestSchema>;
