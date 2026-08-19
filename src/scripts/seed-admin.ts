import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import postgres from 'postgres';

const nodeEnv = process.argv[2] ?? process.env.NODE_ENV ?? 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

const databaseUrl = process.env.SEED_DATABASE_URL ?? process.env.MIGRATION_DATABASE_URL;
if (!databaseUrl) throw new Error('SEED_DATABASE_URL or MIGRATION_DATABASE_URL is required');

const sql = postgres(databaseUrl, { ssl: nodeEnv === 'production' ? 'require' : false });
const passwordHash = await bcrypt.hash('1234', 10);

await sql`
  INSERT INTO app_auth."user" (username, password_hash, role)
  VALUES ('micha', ${passwordHash}, 'admin')
  ON CONFLICT (username) DO UPDATE
  SET password_hash = EXCLUDED.password_hash, role = 'admin', updated_at = NOW()
`;

await sql.end();
console.log('Seeded admin: micha');
