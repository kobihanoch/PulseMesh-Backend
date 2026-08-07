import { z } from 'zod';

const registrantFields = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(7).max(30),
  medicalTraining: z.string().trim().min(1).max(100).optional(),
});

const locationInput = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const defibrillatorInput = z.object({
  isMobile: z.boolean().default(true),
});

const loraDeviceInput = z.object({
  devEui: z.string().trim().regex(/^[A-Fa-f0-9]{16}$/),
});

const equipmentInput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('defibrillator_only'),
    defibrillator: defibrillatorInput,
  }),
  z.object({
    type: z.literal('defibrillator_with_lora'),
    defibrillator: defibrillatorInput,
    loraDevice: loraDeviceInput,
  }),
  z.object({
    type: z.literal('lora_only'),
    loraDevice: loraDeviceInput,
  }),
]);

export const createRegistrationRequest = z.object({
  body: registrantFields.extend({ equipment: equipmentInput, location: locationInput.optional() }),
});

export const listRegistrationsRequest = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
  }),
});

export const getRegistrationRequest = z.object({
  params: z.object({ registrantId: z.string().uuid() }),
});

export const updateRegistrationRequest = z.object({
  params: z.object({ registrantId: z.string().uuid() }),
  body: registrantFields.partial().refine((fields) => Object.keys(fields).length > 0, {
    message: 'At least one field is required',
  }),
});

export const deleteRegistrationRequest = getRegistrationRequest;
export const updateRegistrantLocationRequest = z.object({
  params: z.object({ registrantId: z.string().uuid() }),
  body: locationInput,
});

export type CreateRegistrationRequest = z.infer<typeof createRegistrationRequest>['body'];
export type ListRegistrationsRequest = z.infer<typeof listRegistrationsRequest>['query'];
export type GetRegistrationRequest = z.infer<typeof getRegistrationRequest>;
export type UpdateRegistrationRequest = z.infer<typeof updateRegistrationRequest>;
export type DeleteRegistrationRequest = z.infer<typeof deleteRegistrationRequest>;
export type UpdateRegistrantLocationRequest = z.infer<typeof updateRegistrantLocationRequest>;
