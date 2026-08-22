import { deleteCached, getCached, setCached } from '../../infrastructure/cache/redis.config.ts';

const SUMMARY_TTL = 60;
export const registrationCacheKeys = {
  count: 'dashboard:registrations:count',
};
export const getCachedRegistrationCount = () => getCached<number>(registrationCacheKeys.count);
export const cacheRegistrationCount = (count: number) => setCached(registrationCacheKeys.count, count, SUMMARY_TTL);
export const clearRegistrationCount = () => deleteCached(registrationCacheKeys.count);
