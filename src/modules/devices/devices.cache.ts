import { deleteCached, getCached, setCached } from '../../infrastructure/cache/redis.config.ts';

const SUMMARY_TTL = 60;
export const deviceCacheKeys = {
  count: 'dashboard:devices:count',
};
export const getCachedDeviceCount = () => getCached<number>(deviceCacheKeys.count);
export const cacheDeviceCount = (count: number) => setCached(deviceCacheKeys.count, count, SUMMARY_TTL);
export const clearDeviceCount = () => deleteCached(deviceCacheKeys.count);
