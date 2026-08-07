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

export const telemetryHistoryRequest = z.object({
  params: z.object({ deviceId: z.string().uuid() }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type TelemetryHistoryRequest = z.infer<typeof telemetryHistoryRequest>;
