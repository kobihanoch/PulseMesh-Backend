import sql from "../../infrastructure/db.client.ts";

// With bump
export async function queryGetUserMetadata(identifier: string) {
  const [user] =
    sql`UPDATE auth.users u SET u.token_version = u.token_version + 1 
      WHERE u.username = ${identifier}::text OR u.email = ${identifier}::text
      RETURNING u.id::uuid, u.username, u.first_name as firstName, u.last_name as lastName, u.email, u.token_version as tokenVersion`;
  return user;
}

export async function queryGetUserAuthorizationDetails(userId: string) {
  const [authorizationDetails] =
    await sql`SELECT id, role FROM auth.user WHERE id=${userId}`;
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

export const queryGetCurrentTokenVersion = async (
  userId: string,
): Promise<number> => {
  const [{ token_version: tokenVersion }] = await sql<number>`
    SELECT token_version FROM users WHERE id=${userId}::uuid
  `;
  return tokenVersion;
};
