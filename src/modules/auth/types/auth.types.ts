import { User } from '../../../infrastructure/db/postgresql/schema/auth/user.schema.ts';
import type { JwtPayload } from 'jsonwebtoken';

export interface JWTCustomPayload extends JwtPayload {
  id: User['id'];
  role: User['role'];
  tokenVer: User['tokenVersion'];
}

export type UserMetaData = User;
export type UserAuthorizationDetails = Pick<User, 'id' | 'role' | 'tokenVersion'>;
