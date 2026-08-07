import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/db/postgresql/schema/**/*.schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL!,
  },
});
