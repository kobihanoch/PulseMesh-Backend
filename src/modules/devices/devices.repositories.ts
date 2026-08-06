import sql from '../../infrastructure/db/db.client.ts';
import type { ListDevicesRequest } from './types/devices.request.types.ts';
import type {
  DefibrillatorQueryResult,
  DeletedDeviceQueryResult,
  DeviceQueryResult,
  DevicesCountQueryResult,
  LoraDeviceQueryResult,
} from './types/devices.types.ts';

export async function queryListDevices(filters: ListDevicesRequest, offset: number) {
  return sql<DeviceQueryResult[]>`
    SELECT * FROM (
      SELECT
        id, owner_id AS "ownerId", is_mobile AS "isMobile", status::text,
        created_at AS "createdAt", updated_at AS "updatedAt",
        'defibrillator'::text AS "deviceType",
        NULL::uuid AS "defibrillatorId", NULL::varchar AS "devEui",
        NULL::integer AS "batteryPercentage", NULL::double precision AS latitude,
        NULL::double precision AS longitude, NULL::timestamptz AS "lastTransmissionAt"
      FROM registry.defibrillator
      UNION ALL
      SELECT
        id, owner_id AS "ownerId", NULL::boolean AS "isMobile", status::text,
        created_at AS "createdAt", updated_at AS "updatedAt",
        'lora'::text AS "deviceType",
        defibrillator_id AS "defibrillatorId", dev_eui AS "devEui",
        battery_percentage AS "batteryPercentage", latitude, longitude, last_transmission_at AS "lastTransmissionAt"
      FROM registry.lora_device
    ) devices
    WHERE (${filters.deviceType ?? null}::text IS NULL OR "deviceType" = ${filters.deviceType ?? null})
      AND (${filters.status ?? null}::text IS NULL OR status = ${filters.status ?? null})
      AND (${filters.ownerId ?? null}::uuid IS NULL OR "ownerId" = ${filters.ownerId ?? null}::uuid)
    ORDER BY "createdAt" DESC
    LIMIT ${filters.limit} OFFSET ${offset}
  `;
}

export async function queryCountDevices(filters: ListDevicesRequest) {
  const [count] = await sql<[DevicesCountQueryResult]>`
    SELECT COUNT(*)::integer AS "totalItems"
    FROM (
      SELECT owner_id, status::text, 'defibrillator'::text AS device_type FROM registry.defibrillator
      UNION ALL
      SELECT owner_id, status::text, 'lora'::text AS device_type FROM registry.lora_device
    ) devices
    WHERE (${filters.deviceType ?? null}::text IS NULL OR device_type = ${filters.deviceType ?? null})
      AND (${filters.status ?? null}::text IS NULL OR status = ${filters.status ?? null})
      AND (${filters.ownerId ?? null}::uuid IS NULL OR owner_id = ${filters.ownerId ?? null}::uuid)
  `;
  return count;
}

export async function queryGetDefibrillator(deviceId: string) {
  const [device] = await sql<[DefibrillatorQueryResult?]>`
    SELECT
      id, owner_id AS "ownerId", is_mobile AS "isMobile", status,
      created_at AS "createdAt", updated_at AS "updatedAt",
      'defibrillator'::text AS "deviceType"
    FROM registry.defibrillator
    WHERE id = ${deviceId}::uuid
  `;
  return device;
}

export async function queryGetLoraDevice(deviceId: string) {
  const [device] = await sql<[LoraDeviceQueryResult?]>`
    SELECT
      id, owner_id AS "ownerId", defibrillator_id AS "defibrillatorId",
      dev_eui AS "devEui", status, battery_percentage AS "batteryPercentage",
      latitude, longitude, last_transmission_at AS "lastTransmissionAt",
      created_at AS "createdAt", updated_at AS "updatedAt",
      'lora'::text AS "deviceType"
    FROM registry.lora_device
    WHERE id = ${deviceId}::uuid
  `;
  return device;
}

export async function queryUpdateDefibrillator(device: DefibrillatorQueryResult) {
  const [updatedDevice] = await sql<[DefibrillatorQueryResult?]>`
    UPDATE registry.defibrillator
    SET is_mobile = ${device.isMobile}, status = ${device.status}, updated_at = NOW()
    WHERE id = ${device.id}::uuid
    RETURNING
      id, owner_id AS "ownerId", is_mobile AS "isMobile", status,
      created_at AS "createdAt", updated_at AS "updatedAt",
      'defibrillator'::text AS "deviceType"
  `;
  return updatedDevice;
}

export async function queryUpdateLoraDevice(device: LoraDeviceQueryResult) {
  const [updatedDevice] = await sql<[LoraDeviceQueryResult?]>`
    UPDATE registry.lora_device
    SET defibrillator_id = ${device.defibrillatorId}, status = ${device.status}, updated_at = NOW()
    WHERE id = ${device.id}::uuid
    RETURNING
      id, owner_id AS "ownerId", defibrillator_id AS "defibrillatorId",
      dev_eui AS "devEui", status, battery_percentage AS "batteryPercentage",
      latitude, longitude, last_transmission_at AS "lastTransmissionAt",
      created_at AS "createdAt", updated_at AS "updatedAt",
      'lora'::text AS "deviceType"
  `;
  return updatedDevice;
}

export async function queryDeleteDevice(deviceType: 'defibrillator' | 'lora', deviceId: string) {
  const [deletedDevice] =
    deviceType === 'defibrillator'
      ? await sql<[DeletedDeviceQueryResult?]>`
          DELETE FROM registry.defibrillator WHERE id = ${deviceId}::uuid RETURNING id
        `
      : await sql<[DeletedDeviceQueryResult?]>`
          DELETE FROM registry.lora_device WHERE id = ${deviceId}::uuid RETURNING id
        `;
  return deletedDevice;
}
