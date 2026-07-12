import { z } from "zod";

export const OmniMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "model", "agent_step"]),
  content: z.string(),
  timestamp: z.date().or(z.string().transform((v) => new Date(v))),
  isLoading: z.boolean().optional(),
  recipeData: z.any().optional(),
});

export type OmniMessage = z.infer<typeof OmniMessageSchema>;

export const OmnibarCommandPayloadSchema = z.object({
  chatHistory: z.array(OmniMessageSchema),
  source: z.enum(["omnibar", "wearos"]),
  path: z.string().optional(),
  context: z.record(z.any()).nullish(),
});

export type OmnibarCommandPayload = z.infer<typeof OmnibarCommandPayloadSchema>;
