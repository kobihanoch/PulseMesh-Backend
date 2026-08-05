import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { queryGetUserAuthorizationDetails } from '../../modules/auth/auth.repositories.ts';
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
    return next(createError(401, 'Access token is not valid'));
  }

  const user = await queryGetUserAuthorizationDetails(decoded.id);
  if (!user) return next(createError(404, 'User not found'));

  if (decoded.tokenVer !== user.tokenVersion) {
    return next(createError(401, 'New login required'));
  }

  // Inject to request
  req.user = user;
  next();
};
