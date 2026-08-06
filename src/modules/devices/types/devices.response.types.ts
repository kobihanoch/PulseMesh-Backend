import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { defibrillator } from '../../../infrastructure/db/schema/registry/defibrillator.schema.ts';
import { loraDevice } from '../../../infrastructure/db/schema/registry/lora-device.schema.ts';

export const defibrillatorDeviceResponse = createSelectSchema(defibrillator).extend({
  deviceType: z.literal('defibrillator'),
});

export const loraDeviceResponse = createSelectSchema(loraDevice).extend({
  deviceType: z.literal('lora'),
});

export const deviceResponse = z.discriminatedUnion('deviceType', [defibrillatorDeviceResponse, loraDeviceResponse]);

export const devicesListResponse = z.object({
  items: z.array(deviceResponse),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type DefibrillatorDeviceResponse = z.infer<typeof defibrillatorDeviceResponse>;
export type LoraDeviceResponse = z.infer<typeof loraDeviceResponse>;
export type DeviceResponse = z.infer<typeof deviceResponse>;
export type DevicesListResponse = z.infer<typeof devicesListResponse>;
