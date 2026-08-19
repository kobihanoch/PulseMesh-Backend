import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { createTelemetry } from './telemetry.controller.ts';
import { createTelemetryRequest } from './types/telemetry.request.types.ts';

const router = Router();

router.post('/', validate(createTelemetryRequest), asyncHandler(createTelemetry));

export default router;
