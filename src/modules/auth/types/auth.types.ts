import { User } from '../../../infrastructure/db/schema/user.schema.ts';

export interface JWTCustomPayload {
  id: User['id'];
  role: User['role'];
  tokenVer: User['tokenVersion'];
}

export type UserMetaData = User;
export type UserAuthorizationDetails = Pick<User, 'id' | 'role'>;
export type UserTokenVersion = Pick<User, 'tokenVersion'>;
