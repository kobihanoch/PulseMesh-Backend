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
      passwordHash: text('password_hash').notNull(),
      role: varchar('role', { length: 30 }).notNull().default('admin'),
      tokenVersion: integer('token_version').notNull().default(0),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    // Policies
    (table) => [
      // Guest: login lookup
      pgPolicy('guest_can_login', {
        for: 'select',
        to: guestRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                          ${table.username} = NULLIF(current_setting('app.login_identifier', true), '')`,
      }),

      // Guest: login token bump or refresh
      pgPolicy('guest_can_refresh', {
        for: 'update',
        to: guestRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                          ${table.username} = NULLIF(current_setting('app.login_identifier', true), '')`,
        withCheck: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid OR
                              ${table.username} = NULLIF(current_setting('app.login_identifier', true), '')`,
      }),

      // Authenticated: read own row
      pgPolicy('authenticated_can_select_own_user', {
        for: 'select',
        to: authenticatedRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid`,
      }),

      // Authenticated: update own row
      pgPolicy('authenticated_can_update_own_user', {
        for: 'update',
        to: authenticatedRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid`,
        withCheck: drizzleSql`${table.id} = NULLIF(current_setting('app.user_id', true), '')::uuid`,
      }),

      // Authenticated: delete own row
      pgPolicy('authenticated_can_delete_own_user', {
        for: 'delete',
        to: authenticatedRole,
        using: drizzleSql`${table.id} =NULLIF(current_setting('app.user_id', true), '')::uuid`,
      }),
    ],
  )
  .enableRLS();

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
