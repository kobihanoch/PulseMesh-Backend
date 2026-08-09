import { z } from 'zod';

const routeStep = z.object({
  instruction: z.string(),
  name: z.string(),
  distance: z.number().nonnegative(),
  duration: z.number().nonnegative(),
});

export const cyclingRouteResponse = z.object({
  coordinates: z.array(z.tuple([z.number(), z.number()])),
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  steps: z.array(routeStep),
});

export type CyclingRouteResponse = z.infer<typeof cyclingRouteResponse>;
