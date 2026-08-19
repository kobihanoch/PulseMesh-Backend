import { Router, type RequestHandler } from 'express';
import { authenticate } from '../../shared/middlewares/authentication.ts';
import { authorize } from '../../shared/middlewares/authorization.ts';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { listNotifications } from './notifications.controller.ts';
import { listNotificationsRequest } from './types/notifications.request.types.ts';
import { notificationsListResponse } from './types/notifications.response.types.ts';

const router = Router();

router.get('/', authenticate, authorize('admin'), validate(listNotificationsRequest), asyncHandler(listNotifications, notificationsListResponse) as unknown as RequestHandler);

export default router;
