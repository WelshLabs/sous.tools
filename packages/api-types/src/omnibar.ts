import { z } from "zod";

export const OmnibarCommandPayloadSchema = z.object({
  command: z.string(),
  source: z.enum(["omnibar", "wearos"]),
  path: z.string().optional(),
  context: z.record(z.any()).nullish(),
});

export type OmnibarCommandPayload = z.infer<typeof OmnibarCommandPayloadSchema>;
