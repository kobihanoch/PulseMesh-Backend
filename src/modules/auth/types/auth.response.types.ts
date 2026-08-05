import { z } from 'zod';

export const loginResponse = z.object({
  accessJWT: z.string(),
  refreshJWT: z.string(),
  userMetadata: z.object({
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    id: z.string(),
    email: z.email(),
    tokenVersion: z.number(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponse>;
