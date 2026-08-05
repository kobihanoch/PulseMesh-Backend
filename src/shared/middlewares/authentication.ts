import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
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

  // Inject to request
  // JWT has already been cryptographically verified
  req.user = {
    id: decoded.id,
    role: decoded.role,
    tokenVersion: decoded.tokenVer,
  };
  next();
};
