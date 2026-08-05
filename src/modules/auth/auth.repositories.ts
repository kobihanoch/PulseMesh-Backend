import sql from '../../infrastructure/db/db.client.ts';
import { JWTCustomPayload, UserAuthorizationDetails, UserMetaData } from './types/auth.types.ts';

export async function queryGetUserMetadata(identifier: string) {
  const [user] = await sql<[UserMetaData?]>`
    SELECT
      u.id::uuid, 
      u.username, 
      u.first_name as "firstName", 
      u.last_name as "lastName", 
      u.email,
      u.role,
      u.token_version as "tokenVersion",
      u.created_at as "createdAt",
      u.updated_at as "updatedAt",
      u.password_hash as "passwordHash"
    FROM auth.user u
    WHERE u.username = ${identifier} OR u.email = ${identifier}`;

  return user;
}

export async function queryBumpTokenVersion(userId: string) {
  const [bumpedUser] = await sql<[UserAuthorizationDetails]>`
    UPDATE auth.user 
    SET token_version = token_version + 1 
    WHERE id = ${userId}::uuid
    RETURNING token_version as "tokenVersion", id, role`;

  return bumpedUser;
}

export async function queryBumpTokenVersionCAS(token: JWTCustomPayload) {
  const [refreshedUser] = await sql<[UserAuthorizationDetails?]>`
    UPDATE auth.user 
    SET token_version = token_version + 1 
    WHERE id = ${token.id}::uuid AND token_version = ${token.tokenVer}
    RETURNING token_version as "tokenVersion", id, role`;

  return refreshedUser;
}

export async function queryGetUserAuthorizationDetails(userId: string) {
  const [user] = await sql<[UserAuthorizationDetails]>`
    SELECT token_version as "tokenVersion", id, role FROM auth.user WHERE id=${userId}::uuid
  `;
  return user;
}
