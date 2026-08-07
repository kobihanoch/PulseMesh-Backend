import { Router, type RequestHandler } from 'express';
import { withRlsTx } from '../../infrastructure/db/postgresql/postgresql.client.ts';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { authenticate } from '../../shared/middlewares/authentication.ts';
import { authorize } from '../../shared/middlewares/authorization.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { createRegistration, deleteRegistration, getRegistration, listRegistrations, updateRegistration } from './registrations.controller.ts';
import {
  createRegistrationRequest,
  deleteRegistrationRequest,
  getRegistrationRequest,
  listRegistrationsRequest,
  updateRegistrationRequest,
} from './types/registrations.request.types.ts';
import { registrationResponse, registrationsListResponse } from './types/registrations.response.types.ts';

const router = Router();

// Public registration
router.post('/', validate(createRegistrationRequest), asyncHandler(withRlsTx(createRegistration), registrationResponse));

// Admin registration management
router.use(authenticate, authorize('admin'));
router.get(
  '/',
  validate(listRegistrationsRequest),
  asyncHandler(withRlsTx(listRegistrations), registrationsListResponse) as unknown as RequestHandler,
);
router.get('/:registrantId', validate(getRegistrationRequest), asyncHandler(withRlsTx(getRegistration), registrationResponse));
router.patch('/:registrantId', validate(updateRegistrationRequest), asyncHandler(withRlsTx(updateRegistration), registrationResponse));
router.delete('/:registrantId', validate(deleteRegistrationRequest), asyncHandler(withRlsTx(deleteRegistration)));

export default router;
