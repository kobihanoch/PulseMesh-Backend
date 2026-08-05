import { sql as drizzleSql } from 'drizzle-orm';
import { integer, pgPolicy, pgRole, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('app_auth');
export const authenticatedRole = pgRole('app_authenticated');
export const guestRole = pgRole('app_guest');

export const user = authSchema
  .table(
    'user',
    {
      id: uuid('id').defaultRandom().primaryKey(),
      username: varchar('username', { length: 50 }).notNull().unique(),
      email: varchar('email', { length: 255 }).notNull().unique(),
      passwordHash: text('password_hash').notNull(),
      firstName: varchar('first_name', { length: 100 }).notNull(),
      lastName: varchar('last_name', { length: 100 }).notNull(),
      role: varchar('role', { length: 30 }).notNull().default('user'),
      tokenVersion: integer('token_version').notNull().default(0),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    // Policies
    (table) => [
      pgPolicy('user_access_own_row', {
        for: 'all',
        to: authenticatedRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid`,
        withCheck: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid`,
      }),
    ],
  )
  .enableRLS();

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
