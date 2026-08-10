import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import {
  queryBumpTokenVersion,
  queryBumpTokenVersionCAS,
  queryGetUserById,
  queryGetUserMetadata,
  queryInjectIdentifier,
  queryInjectUserID,
} from './auth.repositories.ts';
import { decodeRefreshJWT, signTokens } from './auth.utils.ts';

export const authenticateUser = async (identifier: string, password: string) => {
  await queryInjectIdentifier(identifier);
  const user = await queryGetUserMetadata(identifier);

  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.passwordHash!);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  const bumpedUser = await queryBumpTokenVersion(user.id);
  const { accessToken, refreshToken } = signTokens(bumpedUser, '5m', '15d');
  const { tokenVersion, passwordHash, ...userWithoutTokenVersionAndPassword } = user;

  return {
    accessToken,
    refreshToken,
    userMetadata: userWithoutTokenVersionAndPassword,
  };
};

export const logoutFromAllDevices = async (refreshToken: string | null) => {
  if (!refreshToken) return;
  const decodedRefresh = decodeRefreshJWT(refreshToken);

  if (decodedRefresh) {
    await queryBumpTokenVersion(decodedRefresh.id);
  }
};

export const refreshSession = async (staleRefreshToken: string | null | undefined) => {
  if (!staleRefreshToken) throw createError(401, 'No refresh token provided');
  const decoded = decodeRefreshJWT(staleRefreshToken);
  if (!decoded) throw createError(401, 'Invalid or expired refresh token');

  await queryInjectUserID(decoded.id);
  const refreshedUser = await queryBumpTokenVersionCAS(decoded);
  if (!refreshedUser) throw createError(401, 'New login required');

  const { accessToken, refreshToken } = signTokens(refreshedUser, '5m', '15d');

  return {
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = (userId: string) => queryGetUserById(userId);
