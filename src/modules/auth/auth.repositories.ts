import sql from '../../infrastructure/db/postgresql/postgresql.client.ts';
import { JWTCustomPayload, UserAuthorizationDetails, UserMetaData } from './types/auth.types.ts';

export async function queryInjectIdentifier(identifier: string) {
  await sql`SELECT set_config('app.login_identifier', ${identifier}, true)`;
}

export async function queryInjectUserID(userId: string) {
  await sql`SELECT set_config('app.user_id', ${userId}, true)`;
}

export async function queryGetUserMetadata(identifier: string) {
  const [user] = await sql<[UserMetaData?]>`
    SELECT
      u.id::uuid, 
      u.username, 
      u.role,
      u.token_version as "tokenVersion",
      u.created_at as "createdAt",
      u.updated_at as "updatedAt",
      u.password_hash as "passwordHash"
    FROM app_auth.user u
    WHERE u.username = ${identifier}`;

  return user;
}

export async function queryBumpTokenVersion(userId: string) {
  const [bumpedUser] = await sql<[UserAuthorizationDetails]>`
    UPDATE app_auth.user 
    SET token_version = token_version + 1 
    WHERE id = ${userId}::uuid
    RETURNING token_version as "tokenVersion", id, role`;

  return bumpedUser;
}

export async function queryBumpTokenVersionCAS(token: JWTCustomPayload) {
  const [refreshedUser] = await sql<[UserAuthorizationDetails?]>`
    UPDATE app_auth.user 
    SET token_version = token_version + 1 
    WHERE id = ${token.id}::uuid AND token_version = ${token.tokenVer}
    RETURNING token_version as "tokenVersion", id, role`;

  return refreshedUser;
}

export async function queryGetUserAuthorizationDetails(userId: string) {
  const [user] = await sql<[UserAuthorizationDetails]>`
    SELECT token_version as "tokenVersion", id, role FROM app_auth.user WHERE id=${userId}::uuid
  `;
  return user;
}

export async function queryGetUserById(userId: string) {
  const [user] = await sql`
    SELECT id, username, role, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM app_auth.user
    WHERE id = ${userId}::uuid
  `;
  return user;
}
