import { mongoDB } from '../../infrastructure/db/mongodb/mongodb.client.ts';
import type { SimulatedNotification } from './notifications.types.ts';
import type { ListNotificationsRequest } from './types/notifications.request.types.ts';

export async function querySaveNotifications(notifications: SimulatedNotification[]) {
  if (notifications.length > 0) await mongoDB.collection<SimulatedNotification>('notifications').insertMany(notifications);
}

export async function queryNotifications({ page, limit, channel }: ListNotificationsRequest) {
  const filter = { channel };
  const collection = mongoDB.collection<SimulatedNotification>('notifications');
  const [items, totalItems] = await Promise.all([
    collection.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);
  return { items, totalItems };
}
