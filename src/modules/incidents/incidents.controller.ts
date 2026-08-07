import type { Request, Response } from 'express';
import { closeIncidentById, createNewIncident, getIncidentById, getIncidentsPage } from './incidents.service.ts';
import type { CreateIncidentRequest, IncidentIdRequest, ListIncidentsRequest, UpdateIncidentRequest } from './types/incidents.request.types.ts';

/**
 * Create an incident and select nearby available devices.
 *
 * Route: POST /incidents
 * Access: Public
 */
export async function createIncident(req: Request<{}, {}, CreateIncidentRequest>, res: Response) {
  const incident = await createNewIncident(req.body);
  return res.status(201).json(incident);
}

/**
 * Return a paginated incident list.
 *
 * Route: GET /incidents
 * Access: Admin
 */
export async function listIncidents(req: Request<{}, {}, {}, ListIncidentsRequest>, res: Response) {
  const incidents = await getIncidentsPage(req.query);
  return res.status(200).json(incidents);
}

/**
 * Return one incident together with its selected candidates.
 *
 * Route: GET /incidents/:incidentId
 * Access: Admin
 */
export async function getIncident(req: Request<IncidentIdRequest['params']>, res: Response) {
  const incident = await getIncidentById(req.params.incidentId);
  return res.status(200).json(incident);
}

/**
 * Resolve or cancel one active incident.
 *
 * Route: PATCH /incidents/:incidentId
 * Access: Admin
 */
export async function updateIncident(req: Request<UpdateIncidentRequest['params'], {}, UpdateIncidentRequest['body']>, res: Response) {
  const incident = await closeIncidentById(req.params.incidentId, req.body.status);
  return res.status(200).json(incident);
}
