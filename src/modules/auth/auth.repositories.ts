import sql from "../../infrastructure/db.client.js";

// With bump
export async function queryGetUserMetadata(identifier: string) {
  return sql`UPDATE auth.users u SET u.token_version = u.token_version + 1 
  WHERE u.username = ${identifier}::text OR u.email = ${identifier}::text
  RETURNING u.id::uuid, u.username, u.first_name, u.last_name, u.email, u.token_version`;
}

export async function queryBumpTokenVersionAndGetSelfDataCAS(
  userId: string,
  prevTokenVer: number,
): Promise<UserAfterBump[]> {
  return sql<UserAfterBump[]>`
    UPDATE users 
    SET token_version = token_version + 1 
    WHERE id = ${userId}::uuid AND token_version = ${prevTokenVer} 
    RETURNING token_version, (to_jsonb(users) - 'password' - 'token_version') AS user_data
  `;
}

export const queryGetCurrentTokenVersion = async (
  userId: string,
): Promise<TokenVersionResult[]> => {
  return sql<TokenVersionResult[]>`
    SELECT token_version FROM users WHERE id=${userId}::uuid
  `;
};
