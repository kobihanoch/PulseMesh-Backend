import { deleteCached, getCached, setCached } from '../../infrastructure/cache/redis.config.ts';

const SUMMARY_TTL = 60;
export const incidentCacheKeys = {
  count: 'dashboard:incidents:count',
};
export const getCachedIncidentCount = () => getCached<number>(incidentCacheKeys.count);
export const cacheIncidentCount = (count: number) => setCached(incidentCacheKeys.count, count, SUMMARY_TTL);
export const clearIncidentCount = () => deleteCached(incidentCacheKeys.count);
