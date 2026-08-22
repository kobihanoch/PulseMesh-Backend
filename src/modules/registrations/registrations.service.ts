import { randomUUID } from 'node:crypto';
import createError from 'http-errors';
import {
  queryCountRegistrants,
  queryCreateDefibrillator,
  queryCreateLoraDevice,
  queryCreateRegistrant,
  queryDeleteRegistrant,
  queryGetDefibrillators,
  queryGetLoraDevices,
  queryGetRegistrant,
  queryListRegistrants,
  queryUpdateRegistrant,
  queryUpdateRegistrantLocation,
} from './registrations.repositories.ts';
import type {
  CreateRegistrationRequest,
  ListRegistrationsRequest,
  UpdateRegistrantLocationRequest,
  UpdateRegistrationRequest,
} from './types/registrations.request.types.ts';
import type { RegistrationQueryResult } from './types/registrations.types.ts';
import {
  cacheRegistrationCount,
  clearRegistrationCount,
  getCachedRegistrationCount,
} from './registrations.cache.ts';
import { clearDeviceCount } from '../devices/devices.cache.ts';

export async function createPublicRegistration(input: CreateRegistrationRequest): Promise<RegistrationQueryResult> {
  const registrantId = randomUUID();
  const now = new Date();
  const registrant = {
    id: registrantId,
    firstName: input.firstName,
    lastName: input.lastName ?? null,
    phone: input.phone,
    medicalTraining: input.medicalTraining ?? null,
    latitude: input.location?.latitude ?? null,
    longitude: input.location?.longitude ?? null,
    lastLocationAt: input.location ? now : null,
    createdAt: now,
    updatedAt: now,
  };

  await queryCreateRegistrant(registrant);

  const defibrillators: RegistrationQueryResult['defibrillators'] = [];
  const loraDevices: RegistrationQueryResult['loraDevices'] = [];

  // If has any type of defi create the defi
  if (input.equipment.type !== 'lora_only') {
    const defibrillator = {
      id: randomUUID(),
      ownerId: registrantId,
      isMobile: input.equipment.defibrillator.isMobile,
      status: 'working' as const,
      createdAt: now,
      updatedAt: now,
    };
    await queryCreateDefibrillator(defibrillator);
    defibrillators.push(defibrillator);
  }

  if (input.equipment.type !== 'defibrillator_only') {
    const loraDevice = {
      id: randomUUID(),
      ownerId: registrantId,
      defibrillatorId: defibrillators[0]?.id ?? null,
      devEui: input.equipment.loraDevice.devEui.toUpperCase(),
      status: 'active' as const,
      batteryPercentage: null,
      latitude: null,
      longitude: null,
      lastTransmissionAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await queryCreateLoraDevice(loraDevice);
    loraDevices.push(loraDevice);
  }

  const registration = { ...registrant, defibrillators, loraDevices };
  await clearRegistrationCount();
  await clearDeviceCount();
  return registration;
}

export async function updateRegistrantLocation(registrantId: string, location: UpdateRegistrantLocationRequest['body']) {
  const registrant = await queryUpdateRegistrantLocation(registrantId, location);
  if (!registrant) throw createError(404, 'Registration not found');
  return registrant;
}

export async function getRegistrationsPage(query: ListRegistrationsRequest) {
  const offset = (query.page - 1) * query.limit;
  const cachedCount = query.search ? null : await getCachedRegistrationCount();
  const [registrants, count] = await Promise.all([
    queryListRegistrants(query.limit, offset, query.search),
    cachedCount === null ? queryCountRegistrants(query.search) : null,
  ]);
  const totalItems = cachedCount ?? count!.totalItems;
  if (!query.search && cachedCount === null) await cacheRegistrationCount(totalItems);
  const items = await attachEquipment(registrants);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    },
  };
}

export async function getRegistrationById(registrantId: string) {
  const registrant = await queryGetRegistrant(registrantId);
  if (!registrant) throw createError(404, 'Registration not found');
  const [registration] = await attachEquipment([registrant]);
  return registration;
}

export async function updateRegistrationById(registrantId: string, changes: UpdateRegistrationRequest['body']) {
  const current = await queryGetRegistrant(registrantId);
  if (!current) throw createError(404, 'Registration not found');

  const updated = await queryUpdateRegistrant({ ...current, ...changes });
  if (!updated) throw createError(404, 'Registration not found');
  const [registration] = await attachEquipment([updated]);
  return registration;
}

export async function deleteRegistrationById(registrantId: string) {
  const deleted = await queryDeleteRegistrant(registrantId);
  if (!deleted) throw createError(404, 'Registration not found');
  await clearRegistrationCount();
  await clearDeviceCount();
}

async function attachEquipment(registrants: RegistrationQueryResult[] | Omit<RegistrationQueryResult, 'defibrillators' | 'loraDevices'>[]) {
  const ownerIds = registrants.map((registrant) => registrant.id);
  const [defibrillators, loraDevices] = await Promise.all([queryGetDefibrillators(ownerIds), queryGetLoraDevices(ownerIds)]);

  return registrants.map((registrant) => ({
    ...registrant,
    defibrillators: defibrillators[registrant.id] ?? [],
    loraDevices: loraDevices[registrant.id] ?? [],
  }));
}
