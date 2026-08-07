import sql from '../../infrastructure/db/postgresql/postgresql.client.ts';
import { randomUUID } from 'node:crypto';
import type { Incident } from '../../infrastructure/db/postgresql/schema/registry/incident.schema.ts';
import type { CreateIncidentRequest } from './types/incidents.request.types.ts';
import type { IncidentCandidateDetails, IncidentDetails, IncidentStatus, NearbyDevice } from './types/incidents.types.ts';

export async function queryCreateIncident(input: CreateIncidentRequest) {
  const incident: Incident = {
    id: randomUUID(),
    source: input.source,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMeters: input.radiusMeters,
    status: 'active',
    description: input.description ?? null,
    createdAt: new Date(),
    closedAt: null,
  };
  await sql`
    INSERT INTO registry.incident
      (id, source, latitude, longitude, radius_meters, status, description, created_at)
    VALUES (${incident.id}, ${incident.source}, ${incident.latitude}, ${incident.longitude},
      ${incident.radiusMeters}, ${incident.status}, ${incident.description}, ${incident.createdAt})
  `;
  return incident;
}

export async function queryEligibleDevices() {
  return sql<Omit<NearbyDevice, 'distanceMeters'>[]>`
    SELECT d.id AS "defibrillatorId", d.owner_id AS "registrantId",
      CASE WHEN l.id IS NOT NULL AND l.status = 'active' AND l.last_transmission_at >= NOW() - INTERVAL '24 hours'
        AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND (l.battery_percentage IS NULL OR l.battery_percentage >= 20)
        THEN l.id END AS "loraDeviceId",
      CASE WHEN l.status = 'active' THEN l.dev_eui END AS "devEui",
      l.battery_percentage AS "batteryPercentage",
      COALESCE(CASE WHEN l.status = 'active' AND l.last_transmission_at >= NOW() - INTERVAL '24 hours' THEN l.latitude END, r.latitude) AS latitude,
      COALESCE(CASE WHEN l.status = 'active' AND l.last_transmission_at >= NOW() - INTERVAL '24 hours' THEN l.longitude END, r.longitude) AS longitude,
      COALESCE(CASE WHEN l.status = 'active' AND l.last_transmission_at >= NOW() - INTERVAL '24 hours' THEN l.last_transmission_at END, r.last_location_at) AS "lastTransmissionAt"
    FROM registry.defibrillator d
    LEFT JOIN registry.registrant r ON r.id = d.owner_id
    LEFT JOIN registry.lora_device l ON l.defibrillator_id = d.id
    WHERE d.status = 'working' AND (
      (l.status = 'active' AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
        AND l.last_transmission_at >= NOW() - INTERVAL '24 hours'
        AND (l.battery_percentage IS NULL OR l.battery_percentage >= 20))
      OR (r.latitude IS NOT NULL AND r.longitude IS NOT NULL AND r.last_location_at >= NOW() - INTERVAL '24 hours')
    )
  `;
}

export async function querySaveCandidates(incidentId: string, devices: NearbyDevice[]) {
  const notifiedAt = new Date();
  const candidates: IncidentCandidateDetails[] = [];

  for (const device of devices) {
    const candidateId = randomUUID();
    await sql`
      INSERT INTO registry.incident_candidate
        (id, incident_id, defibrillator_id, lora_device_id, distance_meters, status, notified_at)
      VALUES (${candidateId}, ${incidentId}, ${device.defibrillatorId}, ${device.loraDeviceId}, ${device.distanceMeters}, 'notified', ${notifiedAt})
    `;
    candidates.push({
      ...device,
      candidateId,
      status: 'notified',
      notifiedAt,
      respondedAt: null,
      notifications: { push: 'simulated', lora: device.loraDeviceId ? 'simulated' : 'unavailable' },
    });
  }

  return candidates;
}

export function queryListIncidents(limit: number, offset: number) {
  return sql<Incident[]>`
    SELECT id, source, latitude, longitude, radius_meters AS "radiusMeters", status,
      description, created_at AS "createdAt", closed_at AS "closedAt"
    FROM registry.incident ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function queryCountIncidents() {
  const [result] = await sql<[{ totalItems: number }]>`
    SELECT COUNT(*)::integer AS "totalItems" FROM registry.incident
  `;
  return result.totalItems;
}

export async function queryGetIncident(incidentId: string) {
  const [incident] = await sql<[Incident?]>`
    SELECT id, source, latitude, longitude, radius_meters AS "radiusMeters", status,
      description, created_at AS "createdAt", closed_at AS "closedAt"
    FROM registry.incident WHERE id = ${incidentId}
  `;
  if (!incident) return undefined;

  const candidates = await sql<IncidentCandidateDetails[]>`
    SELECT c.id AS "candidateId", d.id AS "defibrillatorId", d.owner_id AS "registrantId",
      l.id AS "loraDeviceId", l.dev_eui AS "devEui",
      COALESCE(l.latitude, r.latitude) AS latitude, COALESCE(l.longitude, r.longitude) AS longitude,
      l.battery_percentage AS "batteryPercentage", COALESCE(l.last_transmission_at, r.last_location_at) AS "lastTransmissionAt",
      c.distance_meters AS "distanceMeters", c.status, c.notified_at AS "notifiedAt",
      c.responded_at AS "respondedAt",
      json_build_object('push', 'simulated', 'lora', CASE WHEN l.id IS NULL THEN 'unavailable' ELSE 'simulated' END) AS notifications
    FROM registry.incident_candidate c
    JOIN registry.defibrillator d ON d.id = c.defibrillator_id
    LEFT JOIN registry.registrant r ON r.id = d.owner_id
    LEFT JOIN registry.lora_device l ON l.id = c.lora_device_id
    WHERE c.incident_id = ${incidentId}
    ORDER BY c.distance_meters
  `;
  return { ...incident, candidates } satisfies IncidentDetails;
}

export async function queryRespondToCandidate(incidentId: string, candidateId: string, status: 'accepted' | 'declined') {
  const result = await sql`
    UPDATE registry.incident_candidate candidate
    SET status = ${status}, responded_at = NOW()
    WHERE candidate.id = ${candidateId}
      AND candidate.incident_id = ${incidentId}
      AND candidate.status = 'notified'
      AND EXISTS (
        SELECT 1 FROM registry.incident
        WHERE id = candidate.incident_id AND status = 'active'
      )
  `;
  if (result.count === 0) return undefined;

  const [candidate] = await sql<[IncidentCandidateDetails?]>`
    SELECT c.id AS "candidateId", d.id AS "defibrillatorId", d.owner_id AS "registrantId",
      l.id AS "loraDeviceId", l.dev_eui AS "devEui",
      COALESCE(l.latitude, r.latitude) AS latitude, COALESCE(l.longitude, r.longitude) AS longitude,
      l.battery_percentage AS "batteryPercentage", COALESCE(l.last_transmission_at, r.last_location_at) AS "lastTransmissionAt",
      c.distance_meters AS "distanceMeters", c.status, c.notified_at AS "notifiedAt",
      c.responded_at AS "respondedAt",
      json_build_object('push', 'simulated', 'lora', CASE WHEN l.id IS NULL THEN 'unavailable' ELSE 'simulated' END) AS notifications
    FROM registry.incident_candidate c
    JOIN registry.defibrillator d ON d.id = c.defibrillator_id
    LEFT JOIN registry.registrant r ON r.id = d.owner_id
    LEFT JOIN registry.lora_device l ON l.id = c.lora_device_id
    WHERE c.id = ${candidateId} AND c.incident_id = ${incidentId}
  `;
  return candidate;
}

export async function queryCloseIncident(incidentId: string, status: Exclude<IncidentStatus, 'active'>) {
  const [incident] = await sql<[Incident?]>`
    UPDATE registry.incident SET status = ${status}, closed_at = NOW()
    WHERE id = ${incidentId} AND status = 'active'
    RETURNING id, source, latitude, longitude, radius_meters AS "radiusMeters", status,
      description, created_at AS "createdAt", closed_at AS "closedAt"
  `;
  return incident;
}
