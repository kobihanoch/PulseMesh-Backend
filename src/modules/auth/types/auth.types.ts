import { User } from '../../../infrastructure/db/schema/auth/user.schema.ts';

export interface JWTCustomPayload {
  id: User['id'];
  role: User['role'];
  tokenVer: User['tokenVersion'];
}

export type UserMetaData = User;
export type UserAuthorizationDetails = Pick<User, 'id' | 'role' | 'tokenVersion'>;
