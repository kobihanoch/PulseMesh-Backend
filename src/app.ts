import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import userRoutes from './modules/auth/auth.routes.ts';
import deviceRoutes from './modules/devices/devices.routes.ts';
import registrationRoutes from './modules/registrations/registrations.routes.ts';
import incidentRoutes from './modules/incidents/incidents.routes.ts';
import telemetryRoutes from './modules/telemetry/telemetry.routes.ts';
import marketingContentRoutes from './modules/marketing-content/marketing-content.routes.ts';
import routingRoutes from './modules/routing/routing.routes.ts';
import { errorHandler } from './shared/middlewares/error-handler.ts';
import { generalLimiter } from './shared/middlewares/rate-limiter.ts';
import cookieParser from 'cookie-parser';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: 'http://localhost:3000',
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

  app.use('/auth', userRoutes);
  app.use('/registrations', registrationRoutes);
  app.use('/devices', deviceRoutes);
  app.use('/incidents', incidentRoutes);
  app.use('/telemetry', telemetryRoutes);
  app.use('/marketing-content', marketingContentRoutes);
  app.use('/routes', routingRoutes);

  app.use(errorHandler);

  return app;
};
