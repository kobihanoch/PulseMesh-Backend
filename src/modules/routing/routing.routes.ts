import { Router } from 'express';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { createCyclingRoute } from './routing.controller.ts';
import { cyclingRouteRequest } from './types/routing.request.types.ts';
import { cyclingRouteResponse } from './types/routing.response.types.ts';

const router = Router();

router.post('/cycling', validate(cyclingRouteRequest), asyncHandler(createCyclingRoute, cyclingRouteResponse));

export default router;
