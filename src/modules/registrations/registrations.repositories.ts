import sql from '../../infrastructure/db/postgresql/postgresql.client.ts';
import type {
  DefibrillatorQueryResult,
  DefibrillatorsByOwner,
  DefibrillatorsByOwnerQueryResult,
  DeletedRegistrantQueryResult,
  LoraDeviceQueryResult,
  LoraDevicesByOwner,
  LoraDevicesByOwnerQueryResult,
  RegistrantQueryResult,
  RegistrationsCountQueryResult,
} from './types/registrations.types.ts';

type NewRegistrant = Pick<RegistrantQueryResult, 'id' | 'firstName' | 'lastName' | 'phone' | 'medicalTraining' | 'latitude' | 'longitude' | 'lastLocationAt'>;
type NewDefibrillator = Pick<DefibrillatorQueryResult, 'id' | 'ownerId' | 'isMobile'>;
type NewLoraDevice = Pick<LoraDeviceQueryResult, 'id' | 'ownerId' | 'defibrillatorId' | 'devEui'>;

export async function queryCreateRegistrant(registrant: NewRegistrant) {
  await sql`
    INSERT INTO registry.registrant (id, first_name, last_name, phone, medical_training, latitude, longitude, last_location_at)
    VALUES (${registrant.id}, ${registrant.firstName}, ${registrant.lastName}, ${registrant.phone}, ${registrant.medicalTraining},
      ${registrant.latitude}, ${registrant.longitude}, ${registrant.lastLocationAt})
  `;
}

export async function queryCreateDefibrillator(defibrillator: NewDefibrillator) {
  await sql`
    INSERT INTO registry.defibrillator (id, owner_id, is_mobile)
    VALUES (${defibrillator.id}, ${defibrillator.ownerId}, ${defibrillator.isMobile})
  `;
}

export async function queryCreateLoraDevice(device: NewLoraDevice) {
  await sql`
    INSERT INTO registry.lora_device (id, owner_id, defibrillator_id, dev_eui)
    VALUES (${device.id}, ${device.ownerId}, ${device.defibrillatorId}, ${device.devEui})
  `;
}

export async function queryListRegistrants(limit: number, offset: number, search?: string) {
  return sql<RegistrantQueryResult[]>`
    SELECT
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      phone,
      medical_training AS "medicalTraining",
      latitude, longitude, last_location_at AS "lastLocationAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM registry.registrant
    WHERE (${search ?? null}::text IS NULL
      OR first_name ILIKE '%' || ${search ?? null} || '%'
      OR last_name ILIKE '%' || ${search ?? null} || '%'
      OR phone ILIKE '%' || ${search ?? null} || '%')
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function queryCountRegistrants(search?: string) {
  const [count] = await sql<[RegistrationsCountQueryResult]>`
    SELECT COUNT(*)::integer AS "totalItems"
    FROM registry.registrant
    WHERE (${search ?? null}::text IS NULL
      OR first_name ILIKE '%' || ${search ?? null} || '%'
      OR last_name ILIKE '%' || ${search ?? null} || '%'
      OR phone ILIKE '%' || ${search ?? null} || '%')
  `;
  return count;
}

export async function queryGetRegistrant(registrantId: string) {
  const [registrant] = await sql<[RegistrantQueryResult?]>`
    SELECT
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      phone,
      medical_training AS "medicalTraining",
      latitude, longitude, last_location_at AS "lastLocationAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM registry.registrant
    WHERE id = ${registrantId}::uuid
  `;
  return registrant;
}

export async function queryGetDefibrillators(ownerIds: string[]) {
  if (ownerIds.length === 0) return {} as DefibrillatorsByOwner;
  const [result] = await sql<[DefibrillatorsByOwnerQueryResult]>`
    SELECT COALESCE(jsonb_object_agg(owner_id, devices), '{}'::jsonb) AS "devicesByOwner"
    FROM (
      SELECT owner_id, jsonb_agg(jsonb_build_object(
        'id', id,
        'ownerId', owner_id,
        'isMobile', is_mobile,
        'status', status,
        'createdAt', created_at,
        'updatedAt', updated_at
      )) AS devices
      FROM registry.defibrillator
      WHERE owner_id = ANY(${ownerIds}::uuid[])
      GROUP BY owner_id
    ) grouped_devices
  `;
  return restoreDeviceDates(result.devicesByOwner);
}

export async function queryGetLoraDevices(ownerIds: string[]) {
  if (ownerIds.length === 0) return {} as LoraDevicesByOwner;
  const [result] = await sql<[LoraDevicesByOwnerQueryResult]>`
    SELECT COALESCE(jsonb_object_agg(owner_id, devices), '{}'::jsonb) AS "devicesByOwner"
    FROM (
      SELECT owner_id, jsonb_agg(jsonb_build_object(
        'id', id,
        'ownerId', owner_id,
        'defibrillatorId', defibrillator_id,
        'devEui', dev_eui,
        'status', status,
        'batteryPercentage', battery_percentage,
        'latitude', latitude,
        'longitude', longitude,
        'lastTransmissionAt', last_transmission_at,
        'createdAt', created_at,
        'updatedAt', updated_at
      )) AS devices
      FROM registry.lora_device
      WHERE owner_id = ANY(${ownerIds}::uuid[])
      GROUP BY owner_id
    ) grouped_devices
  `;
  return restoreDeviceDates(result.devicesByOwner, true);
}

export async function queryUpdateRegistrant(registrant: NewRegistrant) {
  const [updatedRegistrant] = await sql<[RegistrantQueryResult?]>`
    UPDATE registry.registrant
    SET
      first_name = ${registrant.firstName},
      last_name = ${registrant.lastName},
      phone = ${registrant.phone},
      medical_training = ${registrant.medicalTraining},
      updated_at = NOW()
    WHERE id = ${registrant.id}::uuid
    RETURNING
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      phone,
      medical_training AS "medicalTraining",
      latitude, longitude, last_location_at AS "lastLocationAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  return updatedRegistrant;
}

export async function queryUpdateRegistrantLocation(registrantId: string, location: { latitude: number; longitude: number }) {
  await sql`SELECT set_config('app.registrant_id', ${registrantId}, true)`;
  const [registrant] = await sql<[RegistrantQueryResult?]>`
    UPDATE registry.registrant
    SET latitude = ${location.latitude}, longitude = ${location.longitude}, last_location_at = NOW(), updated_at = NOW()
    WHERE id = ${registrantId}
    RETURNING id, first_name AS "firstName", last_name AS "lastName", phone,
      medical_training AS "medicalTraining", latitude, longitude, last_location_at AS "lastLocationAt",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return registrant;
}

export async function queryDeleteRegistrant(registrantId: string) {
  const [deletedRegistrant] = await sql<[DeletedRegistrantQueryResult?]>`
    DELETE FROM registry.registrant
    WHERE id = ${registrantId}::uuid
    RETURNING id
  `;
  return deletedRegistrant;
}

// In jsonb agg frunctions we get timestampz as a string. Converting it to  dates for consinstent backend types
function restoreDeviceDates<T extends { createdAt: Date; updatedAt: Date; lastTransmissionAt?: Date | null }>(
  devicesByOwner: Record<string, T[]>,
  hasTransmission = false,
) {
  for (const devices of Object.values(devicesByOwner)) {
    for (const device of devices) {
      device.createdAt = new Date(device.createdAt);
      device.updatedAt = new Date(device.updatedAt);
      if (hasTransmission && device.lastTransmissionAt) device.lastTransmissionAt = new Date(device.lastTransmissionAt);
    }
  }
  return devicesByOwner;
}
