import type { JWTPayload } from "../../modules/auth/types/auth.types.ts";
import type { Logger } from "pino";

export interface AuthenticatedUser {
  id: JWTPayload["id"];
  role: JWTPayload["role"];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
