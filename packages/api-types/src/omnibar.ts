import { z } from "zod";

export const OmnibarCommandPayloadSchema = z.object({
  command: z.string(),
  source: z.enum(["omnibar", "wearos"]),
  context: z.record(z.any()).optional(),
});

export type OmnibarCommandPayload = z.infer<typeof OmnibarCommandPayloadSchema>;
