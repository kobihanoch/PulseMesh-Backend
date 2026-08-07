import createError from 'http-errors';
import { querySaveTelemetryHistory, queryUpdateDevice } from './telemetry.repository.ts';
import type { CreateTelemetryRequest } from './types/telemetry.request.types.ts';
import type { TelemetryHistoryRequest } from './types/telemetry.request.types.ts';
import { queryTelemetryHistory } from './telemetry.repository.ts';
import { simulateLowBatteryNotification } from '../notifications/notifications.service.ts';

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

  const lowBatteryAlert = input.batteryPercentage < 20;
  if (lowBatteryAlert) await simulateLowBatteryNotification(device.ownerId, device.id);

  return { ...input, deviceId: device.id, receivedAt: device.lastTransmissionAt, lowBatteryAlert };
}

export async function getTelemetryHistory(input: TelemetryHistoryRequest) {
  const { items, totalItems } = await queryTelemetryHistory(input.params.deviceId, input.query.page, input.query.limit);
  return {
    items,
    pagination: {
      page: input.query.page,
      limit: input.query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / input.query.limit),
    },
  };
}
