import bcrypt from "bcryptjs";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import {
  queryBumpTokenVersionAndGetSelfData,
  queryBumpTokenVersionAndGetSelfDataCAS,
  queryGetUserMetadata,
  queryUpdateExpoPushTokenToNull,
} from "./auth.repositories.js";
import { decodeRefreshToken, signJWT } from "./auth.utils.js";
import { LoginResponse } from "./types/auth.response.types.js";
import { JWTPayload } from "./types/auth.types.js";

export const loginUser = async (
  identifier: string,
  password: string,
): Promise<LoginResponse> => {
  const [user = null] = await queryGetUserMetadata(identifier);
  if (!user) throw createError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password!);
  if (!isMatch) throw createError(401, "Invalid credentials");

  const userClaims: JWTPayload = {
    id: user.id,
    role: user.role,
    tokenVer: user.tokenVersion,
  };

  const accessToken = signJWT(userClaims, "5m");
  const refreshToken = signJWT(userClaims, "15d");

  return {
    accessJWT: accessToken,
    refreshJWT: refreshToken,
    userMetadata: user,
  };
};

export const logoutUserData = async (
  refreshToken: string | null | undefined,
): Promise<void> => {
  const decodedRefresh = decodeRefreshToken(
    refreshToken ?? null,
  ) as AccessTokenPayload | null;

  if (decodedRefresh) {
    await queryBumpTokenVersionAndGetSelfData(decodedRefresh.id);
  }
};

export const refreshAccessTokenData = async (
  refreshToken: string | null | undefined,
  dpopJkt: string | null | undefined,
): Promise<RefreshTokenResponse> => {
  if (appConfig.dpopEnabled) {
    if (!dpopJkt) {
      throw createError(500, "Internal error: DPoP JKT not found on request.");
    }
  }

  if (!refreshToken) throw createError(401, "No refresh token provided");

  const decoded = decodeRefreshToken(
    refreshToken ?? null,
  ) as AccessTokenPayload | null;
  if (!decoded) throw createError(401, "Invalid or expired refresh token");

  if (appConfig.dpopEnabled) {
    const tokenJkt = decoded.cnf?.jkt;
    if (tokenJkt && tokenJkt !== dpopJkt) {
      throw createError(401, "Proof-of-Possession failed (JKT mismatch).");
    }
  }

  const [user = null] = await queryBumpTokenVersionAndGetSelfDataCAS(
    decoded.id,
    decoded.tokenVer,
  );
  if (!user) throw createError(401, "New login required");

  const { token_version, user_data: userData } = user;

  const cnfClaim = dpopJkt
    ? {
        cnf: {
          jkt: dpopJkt
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, ""),
        },
      }
    : {};

  const newAccess = jwt.sign(
    {
      id: userData.id,
      role: userData.role,
      tokenVer: token_version,
      ...cnfClaim,
    },
    authConfig.jwtAccessSecret,
    { expiresIn: "5m" },
  );

  const newRefresh = jwt.sign(
    {
      id: userData.id,
      role: userData.role,
      tokenVer: token_version,
      ...cnfClaim,
    },
    authConfig.jwtRefreshSecret,
    { expiresIn: "14d" },
  );

  return {
    message: "Access token refreshed",
    accessToken: newAccess,
    refreshToken: newRefresh,
    userId: userData.id,
  };
};
