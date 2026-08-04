import { z } from "zod";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export const loginRequest = z.object({
  body: z.object({
    identifier: z.string().min(1),
    password: z.string().min(1),
  }),
});
