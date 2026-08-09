import { z } from 'zod';

const coordinates = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const cyclingRouteRequest = z.object({
  body: z.object({ start: coordinates, end: coordinates }),
});

export type CyclingRouteRequest = z.infer<typeof cyclingRouteRequest>['body'];
