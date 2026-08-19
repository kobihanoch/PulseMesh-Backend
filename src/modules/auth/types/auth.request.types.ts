import { z } from "zod";

export const loginRequest = z.object({
  body: z.object({
    identifier: z.string().min(1),
    password: z.string().min(1),
  }),
});

export type LoginRequest = z.infer<typeof loginRequest>["body"];
