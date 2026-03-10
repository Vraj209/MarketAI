import { z } from "zod";

export const businessOnboardingSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().min(2).max(120),
  audience: z.string().min(10).max(500),
  lifecycle: z.string().min(2).max(80),
  goals: z.string().min(10).max(1000),
  brandVoice: z.string().min(3).max(120),
  competitors: z.string().max(500).optional(),
  challenges: z.string().max(500).optional(),
});

export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>;
