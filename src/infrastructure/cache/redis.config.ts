import { createClient } from 'redis';
import { appConfig } from '../../config/app.config.ts';

export const cacheClient = createClient({ url: process.env.REDIS_URL });

cacheClient.on('error', (error) => console.error('Redis error', error));
const cacheConnection = appConfig.cacheEnabled ? cacheClient.connect() : null;

export const connectCache = async () => {
  if (!appConfig.cacheEnabled) return;
  await cacheConnection;
  console.log('Connected to Redis');
};

export const getCached = async <T>(key: string): Promise<T | null> => {
  if (!appConfig.cacheEnabled) return null;
  const value = await cacheClient.get(key);
  return value ? (JSON.parse(value) as T) : null;
};

export const setCached = async (key: string, value: unknown, ttlSeconds: number) => {
  if (!appConfig.cacheEnabled) return;
  await cacheClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
};

export const deleteCached = async (...keys: string[]) => {
  if (!appConfig.cacheEnabled || keys.length === 0) return;
  await cacheClient.del(keys);
};
