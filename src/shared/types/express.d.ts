import type { JWTCustomPayload } from '../../modules/auth/types/auth.types.ts';

export interface AuthenticatedUser {
  id: JWTCustomPayload['id'];
  role: JWTCustomPayload['role'];
  tokenVersion: JWTCustomPayload['tokenVer'];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
