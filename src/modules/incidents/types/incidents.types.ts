import type { Incident } from '../../../infrastructure/db/schema/registry/incident.schema.ts';
import type { LoraDevice } from '../../../infrastructure/db/schema/registry/lora-device.schema.ts';

export type IncidentStatus = Incident['status'];

export type NearbyDevice = Pick<LoraDevice, 'id' | 'devEui' | 'batteryPercentage'> & {
  latitude: NonNullable<LoraDevice['latitude']>;
  longitude: NonNullable<LoraDevice['longitude']>;
  lastTransmissionAt: NonNullable<LoraDevice['lastTransmissionAt']>;
  distanceMeters: number;
};

export type IncidentDetails = Incident & { candidates: NearbyDevice[] };
