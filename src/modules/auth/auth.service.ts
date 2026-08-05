import bcrypt from 'bcryptjs';
import createError from 'http-errors';

import { queryGetUserMetadata } from './auth.repositories.ts';
import { signJWT } from './auth.utils.ts';
import { LoginResponse } from './types/auth.response.types.ts';
import { JWTCustomPayload } from './types/auth.types.ts';

export const authenticateUser = async (identifier: string, password: string): Promise<LoginResponse> => {
  const user = await queryGetUserMetadata(identifier);
  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.passwordHash!);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  const userClaims: JWTCustomPayload = {
    id: user.id,
    role: user.role,
    tokenVer: user.tokenVersion,
  };

  const accessToken = signJWT(userClaims, '5m');
  const refreshToken = signJWT(userClaims, '15d');

  return {
    accessJWT: accessToken,
    refreshJWT: refreshToken,
    userMetadata: user,
  };
};

/*export const logoutUserData = async (
  refreshToken: string | null | undefined,
): Promise<void> => {
  const decodedRefresh = decodeJWT(refreshToken ?? null);

  if (decodedRefresh) {
    await queryBumpTokenVersionAndGetSelfData(decodedRefresh.id);
  }
};

export const refreshSession = async (
  refreshToken: string | null | undefined,
  dpopJkt: string | null | undefined,
): Promise<RefreshTokenResponse> => {
  if (!refreshToken) throw createError(401, "No refresh token provided");

  const decoded = decodeJWT(refreshToken);
  if (!decoded) throw createError(401, "Invalid or expired refresh token");

  const [user = null] = await queryBumpTokenVersionAndGetSelfDataCAS(
    decoded.id,
    decoded.tokenVer,
  );
  if (!user) throw createError(401, "New login required");

  const { token_version, user_data: userData } = user;

  const newAccessToken = signJWT(userClaims, "5m");
  const newRefreshToken = signJWT(userClaims, "15d");

  return {
    message: "Access token refreshed",
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    userId: userData.id,
  };
};*/
