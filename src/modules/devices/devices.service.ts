import createError from 'http-errors';
import {
  queryCountDevices,
  queryDeleteDevice,
  queryGetDefibrillator,
  queryGetLoraDevice,
  queryListDevices,
  queryUpdateDefibrillator,
  queryUpdateLoraDevice,
} from './devices.repositories.ts';
import type { ListDevicesRequest, UpdateDeviceRequest } from './types/devices.request.types.ts';
import { cacheDeviceCount, clearDeviceCount, getCachedDeviceCount } from './devices.cache.ts';

export async function getDevicesPage(filters: ListDevicesRequest) {
  const offset = (filters.page - 1) * filters.limit;
  const useSummaryCache = !filters.deviceType && !filters.status && !filters.ownerId;
  const cachedCount = useSummaryCache ? await getCachedDeviceCount() : null;
  const [items, count] = await Promise.all([queryListDevices(filters, offset), cachedCount === null ? queryCountDevices(filters) : null]);
  const totalItems = cachedCount ?? count!.totalItems;
  if (useSummaryCache && cachedCount === null) await cacheDeviceCount(totalItems);

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / filters.limit),
    },
  };
}

export async function getDeviceById(deviceType: 'defibrillator' | 'lora', deviceId: string) {
  const device = deviceType === 'defibrillator' ? await queryGetDefibrillator(deviceId) : await queryGetLoraDevice(deviceId);
  if (!device) throw createError(404, 'Device not found');
  return device;
}

export async function updateDeviceById(deviceType: 'defibrillator' | 'lora', deviceId: string, changes: UpdateDeviceRequest['body']) {
  if (deviceType !== changes.deviceType) throw createError(400, 'Device type does not match URL');

  if (deviceType === 'defibrillator' && changes.deviceType === 'defibrillator') {
    const current = await queryGetDefibrillator(deviceId);
    if (!current) throw createError(404, 'Device not found');
    return queryUpdateDefibrillator({ ...current, ...changes });
  }

  if (deviceType === 'lora' && changes.deviceType === 'lora') {
    const current = await queryGetLoraDevice(deviceId);
    if (!current) throw createError(404, 'Device not found');

    if (changes.defibrillatorId) {
      const defibrillator = await queryGetDefibrillator(changes.defibrillatorId);
      if (!defibrillator || defibrillator.ownerId !== current.ownerId) {
        throw createError(400, 'Defibrillator must belong to the same registrant');
      }
    }

    return queryUpdateLoraDevice({ ...current, ...changes });
  }

  throw createError(400, 'Invalid device type');
}

export async function deleteDeviceById(deviceType: 'defibrillator' | 'lora', deviceId: string) {
  const deleted = await queryDeleteDevice(deviceType, deviceId);
  if (!deleted) throw createError(404, 'Device not found');
  await clearDeviceCount();
}
