import { Request } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/auth.config.ts";
import { JWTPayload } from "./types/auth.types.ts";

/*
 * Decode JWT access/refresh token
 */
export const decodeJWT = (refreshToken: string | null): JWTPayload | null => {
  if (!refreshToken) return null;
  try {
    return jwt.verify(refreshToken, authConfig.jwtRefreshSecret);
  } catch {
    return null;
  }
};

/*
 * Sign JWT access/refresh token
 */
export const signJWT = (claims: JWTPayload, exp: string): string => {
  return jwt.sign(claims, authConfig.jwtAccessSecret, { expiresIn: exp });
};

/*
 * Extracts a Bearer token from a header string safely.
 */
export const extractBearerToken = (
  rawHeader: string | undefined,
): string | null => {
  if (!rawHeader || typeof rawHeader !== "string") return null;
  return rawHeader.startsWith("Bearer ")
    ? rawHeader.slice(7).trim()
    : rawHeader.trim() || null;
};

/*
 * Extracts the refresh token from the x-refresh-token header.
 */
export const getRefreshToken = (req: Request): string | null => {
  const refreshHeader = req.headers["x-refresh-token"] as string | undefined;
  return extractBearerToken(refreshHeader);
};

/*
 * Extracts the access token from the Authorization header.
 */
export const getAccessToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  return extractBearerToken(authHeader);
};
