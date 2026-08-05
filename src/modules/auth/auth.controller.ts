import { Request, Response } from 'express';
import { authenticateUser, logoutFromAllDevices } from './auth.service.ts';
import { LoginRequest } from './types/auth.request.types.ts';
import { LoginResponse } from './types/auth.response.types.ts';
import { getRefreshToken } from './auth.utils.ts';

/**
 * Authenticate a user with credentials and issue fresh access and refresh tokens.
 *
 * refresh token pair.
 *
 * Route: POST /auth/login
 * Access: Public
 */
export const loginUser = async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>): Promise<Response<LoginResponse>> => {
  const { identifier, password } = req.body;
  const payload = await authenticateUser(identifier, password);

  res.set('Cache-Control', 'no-store');
  return res.status(200).json(payload);
};

/**
 * Invalidate the authenticated user's current session.
 *
 * Decodes the submitted refresh token when present
 * token, bumps token version state, and returns a success message.
 *
 * Route: POST /api/auth/logout
 * Access: User
 */
export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
  const refreshToken = getRefreshToken(req);
  await logoutFromAllDevices(refreshToken);
  return res.status(204).send();
};

/**
 * Refresh the caller's token pair using a valid refresh token.
 *
 * Validates the refresh token, enforces DPoP proof binding when enabled,
 * rotates token version state, and returns a fresh access and refresh token
 * pair.
 *
 * Route: POST /api/auth/refresh
 * Access: Public
 */
/*export const refreshAccessToken = async (
  req: Request,
  res: Response<RefreshTokenResponse>,
): Promise<Response<RefreshTokenResponse>> => {
  const dpopJkt = req.dpopJkt;
  const refreshToken = getRefreshToken(req);
  const payload = await refreshAccessTokenData(refreshToken, dpopJkt);

  res.set("Cache-Control", "no-store");
  return res.status(200).json(payload);
};*/
