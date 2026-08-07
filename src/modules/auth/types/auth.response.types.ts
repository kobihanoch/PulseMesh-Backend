import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from '../../../infrastructure/db/postgresql/schema/auth/user.schema.ts';

export const loginResponse = createSelectSchema(user).omit({
  tokenVersion: true,
  passwordHash: true,
});

export type LoginResponse = z.infer<typeof loginResponse>;
