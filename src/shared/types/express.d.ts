import { UserEntity } from "@strong-together/shared";
import type { Logger } from "pino";

export interface AuthenticatedUser {
  id: UserEntity["id"];
  role: UserEntity["role"];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
