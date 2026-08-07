import { z } from 'zod';

export const createIncidentRequest = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusMeters: z.number().int().min(100).max(50_000).default(5_000),
    source: z.enum(['app', 'emergency_center', 'simulator']).default('simulator'),
    description: z.string().trim().max(500).optional(),
  }),
});

export const incidentIdRequest = z.object({ params: z.object({ incidentId: z.string().uuid() }) });

export const listIncidentsRequest = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const updateIncidentRequest = incidentIdRequest.extend({
  body: z.object({ status: z.enum(['resolved', 'cancelled']) }),
});

export const respondToCandidateRequest = z.object({
  params: z.object({
    incidentId: z.string().uuid(),
    candidateId: z.string().uuid(),
  }),
  body: z.object({ status: z.enum(['accepted', 'declined']) }),
});

export type CreateIncidentRequest = z.infer<typeof createIncidentRequest>['body'];
export type IncidentIdRequest = z.infer<typeof incidentIdRequest>;
export type ListIncidentsRequest = z.infer<typeof listIncidentsRequest>['query'];
export type UpdateIncidentRequest = z.infer<typeof updateIncidentRequest>;
export type RespondToCandidateRequest = z.infer<typeof respondToCandidateRequest>;
