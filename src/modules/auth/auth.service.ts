import bcrypt from 'bcryptjs';
import createError from 'http-errors';

import { queryBumpTokenVersion, queryBumpTokenVersionCAS, queryGetUserMetadata } from './auth.repositories.ts';
import { decodeRefreshJWT, signAccessJWT, signRefreshJWT } from './auth.utils.ts';
import { LoginResponse } from './types/auth.response.types.ts';
import { JWTCustomPayload } from './types/auth.types.ts';

export const authenticateUser = async (identifier: string, password: string): Promise<LoginResponse> => {
  const user = await queryGetUserMetadata(identifier);
  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.passwordHash!);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  const newTokenVersion = await queryBumpTokenVersion(user.id);

  const userClaims: JWTCustomPayload = {
    id: user.id,
    role: user.role,
    tokenVer: newTokenVersion,
  };

  const accessToken = signAccessJWT(userClaims, '5m');
  const refreshToken = signRefreshJWT(userClaims, '15d');

  const { tokenVersion, passwordHash, ...userWithoutTokenVersionAndPassword } = user;

  return {
    accessJWT: accessToken,
    refreshJWT: refreshToken,
    userMetadata: userWithoutTokenVersionAndPassword,
  };
};

export const logoutFromAllDevices = async (refreshToken: string | null): Promise<void> => {
  if (!refreshToken) return;
  const decodedRefresh = decodeRefreshJWT(refreshToken);

  if (decodedRefresh) {
    await queryBumpTokenVersionCAS(decodedRefresh);
  }
};

/*export const refreshSession = async (
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
