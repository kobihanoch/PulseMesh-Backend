import { Router } from 'express';
import { withRlsTx } from '../../infrastructure/db.client.ts';
import { asyncHandler } from '../../shared/middlewares/async-handler.ts';
import { loginIpLimiter, loginLimiter } from '../../shared/middlewares/rate-limiter.ts';
import { validate } from '../../shared/middlewares/validate-request.ts';
import { loginUser } from './auth.controller.ts';
import { loginRequest } from './types/auth.request.types.ts';
import { loginResponse } from './types/auth.response.types.ts';

const router = Router();

// No authentication required
router.post(
  '/login',
  loginLimiter,
  loginIpLimiter,
  validate(loginRequest),
  asyncHandler(withRlsTx(loginUser), loginResponse),
); // Logging in a user and returns user

/*router.post(
  "/refresh",
  dpopValidationMiddleware,
  asyncHandler(withRlsTx(refreshAccessToken)),
); // Refresh token

// User routes
router.post(
  "/logout",
  dpopValidationMiddleware,
  authenticate,
  authorize("user"),
  asyncHandler(withRlsTx(logoutUser)),
); // Logging out a user*/

export default router;
