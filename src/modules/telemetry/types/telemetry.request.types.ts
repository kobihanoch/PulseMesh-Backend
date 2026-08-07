import { z } from 'zod';

export const createTelemetryRequest = z.object({
  body: z.object({
    devEui: z.string().regex(/^[0-9A-Fa-f]{16}$/).transform((value) => value.toUpperCase()),
    batteryPercentage: z.number().int().min(0).max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export type CreateTelemetryRequest = z.infer<typeof createTelemetryRequest>['body'];
