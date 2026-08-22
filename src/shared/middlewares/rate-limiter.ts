import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import createError from 'http-errors';
import { appConfig } from '../../config/app.config.ts';
import { RedisStore } from 'rate-limit-redis';
import { cacheClient } from '../../infrastructure/cache/redis.config.ts';

const isTestEnv = appConfig.isTest;
const rateLimitStore = (prefix: string) =>
  appConfig.cacheEnabled
    ? new RedisStore({
        sendCommand: (...args: string[]) => cacheClient.sendCommand(args) as Promise<any>,
        prefix: `rate-limit:${prefix}:`,
      })
    : undefined;

const bypassInTest = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  if (isTestEnv) {
    return (req: Request, res: Response, next: NextFunction): void => next();
  }

  return middleware;
};

// 50 per minute (IP behind reverse proxy)
// Limits: Can block multiple users on same NAT or CGNAT
export const generalLimiter = bypassInTest(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50,
    store: rateLimitStore('general'),
    standardHeaders: true,
    validate: false,
    legacyHeaders: false,
    message: 'Too many requests.',
    handler: (req, res, next, options) => {
      next(createError(429, options.message));
    },
  }),
);

// 5 per 15 mins per auth id (burst)
export const loginLimiter = bypassInTest(
  rateLimit({
    windowMs: 60 * 1000 * 15,
    max: 5,
    store: rateLimitStore('login'),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req, res) => getRateLimitKey(req, { bodyKey: 'identifier' }),
    message: "You've reached the maximum amount of login attempts per 15 minutes.",
    handler: (req, res, next, options) => {
      next(createError(429, options.message));
    },
  }),
);

// 5 per 15 minutes per IP
export const loginIpLimiter = bypassInTest(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    store: rateLimitStore('login-ip'),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    handler: (req, res, next, options) => {
      next(createError(429, options.message));
    },
  }),
);

function getRateLimitKey(req: Request, { bodyKey }: { bodyKey?: string } = {}) {
  // 1. If user is authenticated – prefer user id
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }

  // 2. If a specific body field was requested (identifier / username)
  if (bodyKey) {
    const val = req.body?.[bodyKey];
    if (val && typeof val === 'string') {
      return `body:${bodyKey}:${val}`;
    }
  }

  // 3. If client sent a stable device id header
  const clientId = req.headers['x-client-id'];
  if (clientId) {
    return `client:${clientId}`;
  }

  // 4. Fallback to IP (might be NAT/CGNAT)
  return `ip:${req.ip}`;
}
