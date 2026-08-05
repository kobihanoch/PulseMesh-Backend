import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { authConfig } from '../../config/auth.config.ts';
import { JWTCustomPayload } from './types/auth.types.ts';

/*
 * Decode JWT access token
 */
export const decodeAccessJWT = (token: string | null): JwtPayload | string | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, authConfig.jwtAccessSecret) as JWTCustomPayload;
  } catch {
    return null;
  }
};

/*
 * Decode JWT access token
 */
export const decodeRefreshJWT = (token: string | null): JwtPayload | string | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, authConfig.jwtRefreshSecret) as JWTCustomPayload;
  } catch {
    return null;
  }
};

/*
 * Sign JWT access/refresh token
 */
export const signJWT = (claims: JWTCustomPayload, exp: StringValue | undefined): string => {
  return jwt.sign(claims, authConfig.jwtAccessSecret, { expiresIn: exp });
};

/*
 * Extracts a Bearer token from a header string safely.
 */
export const extractBearerToken = (rawHeader: string | undefined): string | null => {
  if (!rawHeader || typeof rawHeader !== 'string') return null;
  return rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim() || null;
};

/*
 * Extracts the refresh token from the x-refresh-token header.
 */
export const getRefreshToken = (req: Request): string | null => {
  const refreshHeader = req.headers['x-refresh-token'] as string | undefined;
  return extractBearerToken(refreshHeader);
};

/*
 * Extracts the access token from the Authorization header.
 */
export const getAccessToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  return extractBearerToken(authHeader);
};
