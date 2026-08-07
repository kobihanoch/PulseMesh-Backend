import createError from 'http-errors';
import { querySaveTelemetryHistory, queryUpdateDevice } from './telemetry.repository.ts';
import type { CreateTelemetryRequest } from './types/telemetry.request.types.ts';

export async function recordTelemetry(input: CreateTelemetryRequest) {
  const device = await queryUpdateDevice(input);
  if (!device) throw createError(404, 'LoRa device not found');

  await querySaveTelemetryHistory({
    deviceId: device.id,
    devEui: device.devEui,
    batteryPercentage: input.batteryPercentage,
    latitude: input.latitude,
    longitude: input.longitude,
    receivedAt: device.lastTransmissionAt!,
  });

  return { ...input, deviceId: device.id, receivedAt: device.lastTransmissionAt };
}
