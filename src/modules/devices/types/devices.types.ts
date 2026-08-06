import type { Defibrillator } from '../../../infrastructure/db/schema/registry/defibrillator.schema.ts';
import type { LoraDevice } from '../../../infrastructure/db/schema/registry/lora-device.schema.ts';

export type DefibrillatorQueryResult = Defibrillator & { deviceType: 'defibrillator' };
export type LoraDeviceQueryResult = LoraDevice & { deviceType: 'lora' };
export type DeviceQueryResult = DefibrillatorQueryResult | LoraDeviceQueryResult;
export type DevicesCountQueryResult = { totalItems: number };
export type DeletedDeviceQueryResult = { id: string };
