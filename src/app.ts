import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import userRoutes from './modules/auth/auth.routes.ts';
import { checkAppVersion } from './shared/middlewares/check-app-version.ts';
import { errorHandler } from './shared/middlewares/error-handler.ts';
import { generalLimiter } from './shared/middlewares/rate-limiter.ts';
import cookieParser from 'cookie-parser';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-app-version', 'x-client-id'],
      exposedHeaders: ['x-min-version'],
      credentials: true,
    }),
  );

  app.use(helmet());
  app.set('trust proxy', 1);
  app.use(generalLimiter);

  app.get('/', (req, res) => {
    res.send('Server is running...');
  });

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  app.use(checkAppVersion);

  app.use('/auth', userRoutes);

  app.use(errorHandler);

  return app;
};
