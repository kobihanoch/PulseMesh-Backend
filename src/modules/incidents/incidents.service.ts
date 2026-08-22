import createError from 'http-errors';
import {
  queryCloseIncident,
  queryCountIncidents,
  queryCreateIncident,
  queryEligibleDevices,
  queryGetIncident,
  queryListIncidents,
  queryRespondToCandidate,
  querySaveCandidates,
} from './incidents.repositories.ts';
import type { CreateIncidentRequest, ListIncidentsRequest } from './types/incidents.request.types.ts';
import { distanceInMeters } from './incidents.utils.ts';
import { simulateIncidentNotifications } from '../notifications/notifications.service.ts';
import { cacheIncidentCount, clearIncidentCount, getCachedIncidentCount } from './incidents.cache.ts';

const MAX_CANDIDATES = 10;

export async function createNewIncident(input: CreateIncidentRequest) {
  const incident = await queryCreateIncident(input);
  const devices = (await queryEligibleDevices())
    .map((device) => ({
      ...device,
      distanceMeters: distanceInMeters(input.latitude, input.longitude, device.latitude, device.longitude),
    }))
    .filter((device) => device.distanceMeters <= input.radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_CANDIDATES);

  const candidates = await querySaveCandidates(incident.id, devices);
  await simulateIncidentNotifications(incident.id, candidates);
  await clearIncidentCount();
  return { ...incident, candidates };
}

export async function getIncidentsPage(query: ListIncidentsRequest) {
  const offset = (query.page - 1) * query.limit;
  const cachedCount = await getCachedIncidentCount();
  const [items, count] = await Promise.all([queryListIncidents(query.limit, offset), cachedCount === null ? queryCountIncidents() : null]);
  const totalItems = cachedCount ?? count!;
  if (cachedCount === null) await cacheIncidentCount(totalItems);
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

export async function getIncidentById(incidentId: string) {
  const incident = await queryGetIncident(incidentId);
  if (!incident) throw createError(404, 'Incident not found');
  return incident;
}

export async function closeIncidentById(incidentId: string, status: 'resolved' | 'cancelled') {
  const incident = await queryCloseIncident(incidentId, status);
  if (!incident) throw createError(404, 'Active incident not found');
  return incident;
}

export async function respondToCandidateById(incidentId: string, candidateId: string, status: 'accepted' | 'declined') {
  const candidate = await queryRespondToCandidate(incidentId, candidateId, status);
  if (!candidate) throw createError(404, 'Active candidate not found');
  return candidate;
}
