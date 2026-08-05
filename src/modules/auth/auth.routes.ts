import { Router } from 'express';
import { withRlsTx } from '../../infrastructure/db/db.client.ts';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { authenticate } from '../../shared/middlewares/authentication.ts';
import { authorize } from '../../shared/middlewares/authorization.ts';
import { loginIpLimiter, loginLimiter } from '../../shared/middlewares/rate-limiter.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { loginUser, logoutUser, refreshAccessToken } from './auth.controller.ts';
import { loginRequest } from './types/auth.request.types.ts';
import { loginResponse } from './types/auth.response.types.ts';

const router = Router();

// No authentication required
router.post('/login', loginLimiter, loginIpLimiter, validate(loginRequest), asyncHandler(withRlsTx(loginUser), loginResponse));
router.post('/refresh', asyncHandler(withRlsTx(refreshAccessToken))); // Refresh token

// User routes
router.post('/logout', authenticate, authorize('user', 'admin'), asyncHandler(withRlsTx(logoutUser)));

export default router;
