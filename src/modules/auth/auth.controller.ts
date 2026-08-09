import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { authenticateUser, getCurrentUser, logoutFromAllDevices, refreshSession } from './auth.service.ts';
import { decodeAccessJWT, decodeRefreshJWT, getAccessToken, getRefreshToken } from './auth.utils.ts';
import { LoginRequest } from './types/auth.request.types.ts';
import { LoginResponse } from './types/auth.response.types.ts';

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
  const { accessToken, refreshToken, userMetadata } = await authenticateUser(identifier, password);
  storeTokensInHTTPOnlyCookie(res, refreshToken, accessToken);
  return res.status(200).json(userMetadata);
};

/**
 * Return the currently authenticated user's public metadata.
 *
 * Route: GET /auth/me
 * Access: User or admin
 */
export const getMe = async (req: Request, res: Response<LoginResponse>): Promise<Response<LoginResponse>> => {
  return res.status(200).json((await getCurrentUser(req.user!.id)) as LoginResponse);
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

  clearTokensInHTTPOnlyCookie(res);

  return res.status(204).send();
};

/**
 * Refresh the caller's token pair using a valid refresh token.
 *
 * Validates the refresh token.
 * rotates token version state, and returns a fresh access and refresh token
 * pair.
 *
 * Route: POST /api/auth/refresh
 * Access: Public
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<Response> => {
  const staleRefreshToken = getRefreshToken(req);
  const { refreshToken, accessToken } = await refreshSession(staleRefreshToken);
  storeTokensInHTTPOnlyCookie(res, refreshToken, accessToken);
  return res.status(204).end();
};

// Helpers
function storeTokensInHTTPOnlyCookie(res: Response, refreshToken: string, accessToken: string) {
  const { exp: refreshExp } = decodeRefreshJWT(refreshToken) as JwtPayload;
  const { exp: accessExp } = decodeAccessJWT(accessToken) as JwtPayload;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: refreshExp! * 1000 - Date.now(),
    path: '/auth/',
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: accessExp! * 1000 - Date.now(),
    path: '/',
  });
}

function clearTokensInHTTPOnlyCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth/',
  });

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
