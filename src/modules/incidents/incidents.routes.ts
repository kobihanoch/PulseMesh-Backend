import { Router, type RequestHandler } from 'express';
import { withRlsTx } from '../../infrastructure/db/postgresql/postgresql.client.ts';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { authenticate } from '../../shared/middlewares/authentication.ts';
import { authorize } from '../../shared/middlewares/authorization.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import * as controller from './incidents.controller.ts';
import {
  createIncidentRequest,
  incidentIdRequest,
  listIncidentsRequest,
  respondToCandidateRequest,
  updateIncidentRequest,
} from './types/incidents.request.types.ts';

const router = Router();

router.post('/', validate(createIncidentRequest), asyncHandler(withRlsTx(controller.createIncident)));
router.patch('/:incidentId/candidates/:candidateId', validate(respondToCandidateRequest), asyncHandler(withRlsTx(controller.respondToCandidate)));

router.use(authenticate, authorize('admin'));
router.get('/', validate(listIncidentsRequest), asyncHandler(withRlsTx(controller.listIncidents)) as unknown as RequestHandler);
router.get('/:incidentId', validate(incidentIdRequest), asyncHandler(withRlsTx(controller.getIncident)));
router.patch('/:incidentId', validate(updateIncidentRequest), asyncHandler(withRlsTx(controller.updateIncident)));

export default router;
