import type { Request, Response } from 'express';
import { recordTelemetry } from './telemetry.service.ts';
import type { CreateTelemetryRequest } from './types/telemetry.request.types.ts';
import type { TelemetryHistoryRequest } from './types/telemetry.request.types.ts';
import { getTelemetryHistory } from './telemetry.service.ts';

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

/**
 * Return one LoRa device's paginated telemetry history.
 *
 * Route: GET /devices/lora/:deviceId/telemetry
 * Access: Admin
 */
export async function listTelemetryHistory(req: Request<TelemetryHistoryRequest['params'], {}, {}, TelemetryHistoryRequest['query']>, res: Response) {
  const history = await getTelemetryHistory({ params: req.params, query: req.query });
  return res.status(200).json(history);
}
