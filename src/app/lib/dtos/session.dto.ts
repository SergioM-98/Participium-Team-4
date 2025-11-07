import { z } from "zod";

export const SessionPayloadSchema = z.object({
  id: z.bigint(),
  role: z.string().optional(),
  expiresAt: z.number(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
