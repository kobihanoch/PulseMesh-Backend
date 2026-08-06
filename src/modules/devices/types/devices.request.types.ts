import { z } from 'zod';

const deviceType = z.enum(['defibrillator', 'lora']);
const deviceParams = z.object({
  deviceType,
  deviceId: z.string().uuid(),
});

export const listDevicesRequest = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    deviceType: deviceType.optional(),
    status: z.enum(['working', 'maintenance', 'out_of_service', 'active', 'inactive']).optional(),
    ownerId: z.string().uuid().optional(),
  }),
});

export const getDeviceRequest = z.object({ params: deviceParams });

export const updateDeviceRequest = z.object({
  params: deviceParams,
  body: z.discriminatedUnion('deviceType', [
    z.object({
      deviceType: z.literal('defibrillator'),
      isMobile: z.boolean().optional(),
      status: z.enum(['working', 'maintenance', 'out_of_service']).optional(),
    }),
    z.object({
      deviceType: z.literal('lora'),
      defibrillatorId: z.string().uuid().nullable().optional(),
      status: z.enum(['active', 'inactive', 'maintenance']).optional(),
    }),
  ]),
});

export const deleteDeviceRequest = getDeviceRequest;

export type ListDevicesRequest = z.infer<typeof listDevicesRequest>['query'];
export type GetDeviceRequest = z.infer<typeof getDeviceRequest>;
export type UpdateDeviceRequest = z.infer<typeof updateDeviceRequest>;
export type DeleteDeviceRequest = z.infer<typeof deleteDeviceRequest>;
