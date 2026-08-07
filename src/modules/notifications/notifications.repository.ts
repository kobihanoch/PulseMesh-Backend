import { mongoDB } from '../../infrastructure/db/mongodb/mongodb.client.ts';
import type { SimulatedNotification } from './notifications.types.ts';

export async function querySaveNotifications(notifications: SimulatedNotification[]) {
  if (notifications.length > 0) await mongoDB.collection<SimulatedNotification>('notifications').insertMany(notifications);
}
