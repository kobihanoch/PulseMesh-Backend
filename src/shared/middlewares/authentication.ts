import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { queryGetCurrentTokenVersion, queryGetUserAuthorizationDetails } from '../../modules/auth/auth.repositories.ts';
import { decodeAccessJWT, getAccessToken } from '../../modules/auth/auth.utils.ts';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Get access token
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    next(createError(401, 'No access token provided'));
    return;
  }

  // Decode
  const decoded = decodeAccessJWT(accessToken);
  if (!decoded) {
    throw createError(401, 'Access token is not valid');
  }

  const tokenVersion = await queryGetCurrentTokenVersion(decoded.id);
  if (!tokenVersion || decoded.tokenVer !== tokenVersion) {
    throw createError(401, 'New login required');
  }

  // Fetch user id and role
  const user = await queryGetUserAuthorizationDetails(decoded.id);

  // If user not found
  if (!user) {
    return next(createError(404, 'User not found'));
  }

  // Inject to request
  req.user = user;
  next();
};
