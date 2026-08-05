import { Request } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../../config/auth.config.ts';
import { JWTCustomPayload, UserAuthorizationDetails } from './types/auth.types.ts';

/*
 * SIgn JWT tokens pair
 */
export const signTokens = (user: UserAuthorizationDetails, accessExp: SignOptions['expiresIn'], refreshExp: SignOptions['expiresIn']) => {
  const userClaims: JWTCustomPayload = {
    id: user.id,
    role: user.role,
    tokenVer: user.tokenVersion,
  };

  const accessToken = signAccessJWT(userClaims, accessExp);
  const refreshToken = signRefreshJWT(userClaims, refreshExp);

  return { refreshToken, accessToken };
};

/*
 * Decode JWT access token
 */
export const decodeAccessJWT = (token: string | null): JWTCustomPayload | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, authConfig.jwtAccessSecret) as JWTCustomPayload;
  } catch {
    return null;
  }
};

/*
 * Decode JWT refresh token
 */
export const decodeRefreshJWT = (token: string | null): JWTCustomPayload | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, authConfig.jwtRefreshSecret) as JWTCustomPayload;
  } catch {
    return null;
  }
};

/*
 * Sign JWT access token
 */
const signAccessJWT = (claims: JWTCustomPayload, exp: SignOptions['expiresIn']): string => {
  return jwt.sign(claims, authConfig.jwtAccessSecret, { expiresIn: exp });
};

/*
 * Sign JWT access token
 */
const signRefreshJWT = (claims: JWTCustomPayload, exp: SignOptions['expiresIn']): string => {
  return jwt.sign(claims, authConfig.jwtRefreshSecret, { expiresIn: exp });
};

/*
 * Extracts a Bearer token from a header string safely.
 */
export const extractBearerToken = (rawHeader: string | undefined): string | null => {
  if (!rawHeader) return null;
  return rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim() || null;
};

/*
 * Extracts the refresh token from the x-refresh-token header.
 */
export const getRefreshToken = (req: Request): string | null => {
  const token = req.cookies.refreshToken;
  return extractBearerToken(token);
};

/*
 * Extracts the access token from the Authorization header.
 */
export const getAccessToken = (req: Request): string | null => {
  const token = req.cookies.accessToken;
  return extractBearerToken(token);
};
