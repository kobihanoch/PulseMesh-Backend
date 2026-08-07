import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { defibrillator } from '../../../infrastructure/db/postgresql/schema/registry/defibrillator.schema.ts';
import { loraDevice } from '../../../infrastructure/db/postgresql/schema/registry/lora-device.schema.ts';
import { registrant } from '../../../infrastructure/db/postgresql/schema/registry/registrant.schema.ts';

export const defibrillatorResponse = createSelectSchema(defibrillator);
export const loraDeviceResponse = createSelectSchema(loraDevice);

export const registrationResponse = createSelectSchema(registrant).extend({
  defibrillators: z.array(defibrillatorResponse),
  loraDevices: z.array(loraDeviceResponse),
});

export const registrationsListResponse = z.object({
  items: z.array(registrationResponse),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type DefibrillatorResponse = z.infer<typeof defibrillatorResponse>;
export type LoraDeviceResponse = z.infer<typeof loraDeviceResponse>;
export type RegistrationResponse = z.infer<typeof registrationResponse>;
export type RegistrationsListResponse = z.infer<typeof registrationsListResponse>;
