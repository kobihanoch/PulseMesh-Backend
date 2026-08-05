import sql from '../../infrastructure/db/db.client.ts';
import { JWTCustomPayload, UserAuthorizationDetails, UserMetaData, UserTokenVersion } from './types/auth.types.ts';

export async function queryGetUserMetadata(identifier: string) {
  const [user] = await sql<[UserMetaData]>`
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

export async function queryGetUserAuthorizationDetails(userId: string) {
  const [authorizationDetails] = await sql<[UserAuthorizationDetails]>`
    SELECT id, role FROM auth.user WHERE id=${userId}`;
  return authorizationDetails;
}

export async function queryBumpTokenVersion(userId: string) {
  const [{ tokenVersion }] = await sql<[Pick<UserMetaData, 'tokenVersion'>]>`
    UPDATE auth.user 
    SET token_version = token_version + 1 
    WHERE id = ${userId}::uuid
    RETURNING token_version as "tokenVersion"`;

  return tokenVersion;
}

export async function queryBumpTokenVersionCAS(token: JWTCustomPayload) {
  const [{ tokenVersion }] = await sql<[Pick<UserMetaData, 'tokenVersion'>]>`
    UPDATE auth.user 
    SET token_version = token_version + 1 
    WHERE id = ${token.id}::uuid AND token_version = ${token.tokenVer}
    RETURNING token_version as "tokenVersion"`;

  return tokenVersion;
}

/*export async function queryBumpTokenVersionAndGetSelfDataCAS(
  userId: string,
  prevTokenVer: number,
): Promise<UserAfterBump[]> {
  return sql<UserAfterBump[]>`
    UPDATE users 
    SET token_version = token_version + 1 
    WHERE id = ${userId}::uuid AND token_version = ${prevTokenVer} 
    RETURNING token_version, (to_jsonb(users) - 'password' - 'token_version') AS user_data
  `;
}*/

export async function queryGetCurrentTokenVersion(userId: string): Promise<number> {
  const [{ tokenVersion }] = await sql<[UserTokenVersion]>`
    SELECT token_version as "tokenVersion" FROM auth.user WHERE id=${userId}::uuid
  `;
  return tokenVersion;
}
