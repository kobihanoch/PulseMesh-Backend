import type { LoraDevice } from '../../../infrastructure/db/postgresql/schema/registry/lora-device.schema.ts';

export type TelemetryHistoryEntry = Pick<LoraDevice, 'devEui'> & {
  deviceId: LoraDevice['id'];
  batteryPercentage: NonNullable<LoraDevice['batteryPercentage']>;
  latitude: NonNullable<LoraDevice['latitude']>;
  longitude: NonNullable<LoraDevice['longitude']>;
  receivedAt: Date;
};
