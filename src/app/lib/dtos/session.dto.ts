import { z } from "zod";

export const SessionPayloadSchema = z.object({
  id: z.int(),
  role: z.string().optional(),
  expiresAt: z.number(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
