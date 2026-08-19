import type { Request, Response } from 'express';
import { getNotificationsPage } from './notifications.service.ts';
import type { ListNotificationsRequest } from './types/notifications.request.types.ts';
import type { NotificationsListResponse } from './types/notifications.response.types.ts';

/**
 * Return a paginated list of simulated Push or LoRa notifications.
 *
 * Route: GET /notifications
 * Access: Admin
 */
export async function listNotifications(
  req: Request<{}, NotificationsListResponse, {}, ListNotificationsRequest>,
  res: Response<NotificationsListResponse>,
) {
  return res.status(200).json(await getNotificationsPage(req.query));
}
