import sql from '../../infrastructure/db/db.client.ts';
import { UserAuthorizationDetails, UserMetaData, UserTokenVersion } from './types/auth.types.ts';

// With bump
export async function queryGetUserMetadata(identifier: string) {
  const [user] = await sql<[UserMetaData]>`
    UPDATE auth.users u SET token_version = token_version + 1 
    WHERE u.username = ${identifier}::text OR u.email = ${identifier}::text
    RETURNING 
      u.id::uuid, 
      u.username, 
      u.first_name as "firstName", 
      u.last_name as "lastName", 
      u.email,
      u.token_version as "tokenVersion",
      u.created_at as "createdAt",
      u.updated_at as "updatedAt",
      u.password_hash as "passwordHash"`;
  return user;
}

export async function queryGetUserAuthorizationDetails(userId: string) {
  const [authorizationDetails] = await sql<[UserAuthorizationDetails]>`
    SELECT id, role FROM auth.user WHERE id=${userId}`;
  return authorizationDetails;
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
    SELECT token_version as "tokenVersion" FROM users WHERE id=${userId}::uuid
  `;
  return tokenVersion;
}
