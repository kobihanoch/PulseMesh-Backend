import type { Request, Response } from 'express';
import { recordTelemetry } from './telemetry.service.ts';
import type { CreateTelemetryRequest } from './types/telemetry.request.types.ts';

/**
 * Store a LoRa telemetry report and update the device's current state.
 *
 * Route: POST /telemetry
 * Access: Public
 */
export async function createTelemetry(req: Request<{}, {}, CreateTelemetryRequest>, res: Response) {
  const telemetry = await recordTelemetry(req.body);
  return res.status(201).json(telemetry);
}
