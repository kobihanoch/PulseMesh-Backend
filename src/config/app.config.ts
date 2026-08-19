import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

export const appConfig = {
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT ?? 5000),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
};
