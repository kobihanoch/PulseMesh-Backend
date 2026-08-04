import { Request, Response } from "express";
import { authenticateUser } from "./auth.service.ts";
import { LoginRequest } from "./types/auth.request.types.ts";
import { LoginResponse } from "./types/auth.response.types.ts";

/**
 * Authenticate a user with credentials and issue fresh access tokens.
 *
 * Validates the submitted credentials, enforces DPoP key binding when enabled,
 * performs first-login side effects when needed, and returns a fresh access and
 * refresh token pair.
 *
 * Route: POST /api/auth/login
 * Access: Public
 */
export const loginUser = async (
  req: Request<{}, LoginResponse, LoginRequest>,
  res: Response<LoginResponse>,
): Promise<Response<LoginResponse>> => {
  const { identifier, password } = req.body;
  const payload = await authenticateUser(identifier, password);

  res.set("Cache-Control", "no-store");
  return res.status(200).json(payload);
};

/**
 * Invalidate the authenticated user's current session.
 *
 * Decodes the submitted refresh token when present, clears the stored push
 * token, bumps token version state, and returns a success message.
 *
 * Route: POST /api/auth/logout
 * Access: User
 */
/*export const logoutUser = async (
  req: Request<{}, LogOutResponse>,
  res: Response<LogOutResponse>,
): Promise<Response<LogOutResponse>> => {
  const refreshToken = getRefreshToken(req);
  await logoutUserData(refreshToken);
  return res.status(200).json({ message: "Logged out successfully" });
};*/

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
