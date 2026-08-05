import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from '../../../infrastructure/db/schema/user.schema.ts';

export const loginResponse = z.object({
  accessJWT: z.string(),
  refreshJWT: z.string(),
  userMetadata: createSelectSchema(user).omit({
    tokenVersion: true,
    passwordHash: true,
  }),
});

export type LoginResponse = z.infer<typeof loginResponse>;
