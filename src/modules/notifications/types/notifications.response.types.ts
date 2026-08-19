import { z } from 'zod';

export const notificationResponse = z.object({
  type: z.enum(['incident', 'low_battery']),
  channel: z.enum(['push', 'lora']),
  status: z.literal('simulated'),
  registrantId: z.string().uuid(),
  deviceId: z.string().uuid(),
  incidentId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
});

export const notificationsListResponse = z.object({
  items: z.array(notificationResponse),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type NotificationResponse = z.infer<typeof notificationResponse>;
export type NotificationsListResponse = z.infer<typeof notificationsListResponse>;
