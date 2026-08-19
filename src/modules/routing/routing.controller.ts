import type { Request, Response } from 'express';
import { getCyclingRoute } from './routing.service.ts';
import type { CyclingRouteRequest } from './types/routing.request.types.ts';
import type { CyclingRouteResponse } from './types/routing.response.types.ts';

/**
 * Calculate a bicycle route between a candidate and an incident.
 *
 * Proxies the request to OpenRouteService so its private API key is never
 * exposed to the frontend.
 *
 * Route: POST /routes/cycling
 * Access: Public simulator
 */
export async function createCyclingRoute(req: Request<{}, CyclingRouteResponse, CyclingRouteRequest>, res: Response<CyclingRouteResponse>) {
  return res.status(200).json(await getCyclingRoute(req.body));
}
