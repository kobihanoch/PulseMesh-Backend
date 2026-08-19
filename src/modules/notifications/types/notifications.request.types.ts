import { z } from 'zod';

export const listNotificationsRequest = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    channel: z.enum(['push', 'lora']),
  }),
});

export type ListNotificationsRequest = z.infer<typeof listNotificationsRequest>['query'];
