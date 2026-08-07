import { sql as drizzleSql } from 'drizzle-orm';
import { boolean, pgPolicy, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole, guestRole } from '../auth/user.schema.ts';
import { registrant, registrySchema } from './registrant.schema.ts';

export const defibrillatorStatus = registrySchema.enum('defibrillator_status', ['working', 'maintenance', 'out_of_service']);

export const defibrillator = registrySchema
  .table(
    'defibrillator',
    {
      id: uuid('id').defaultRandom().primaryKey(),
      ownerId: uuid('owner_id')
        .notNull()
        .references(() => registrant.id, { onDelete: 'cascade' }),
      isMobile: boolean('is_mobile').notNull().default(true),
      status: defibrillatorStatus('status').notNull().default('working'),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
      pgPolicy('guest_can_create_defibrillator', {
        for: 'insert',
        to: guestRole,
        withCheck: drizzleSql`true`,
      }),
      pgPolicy('guest_can_read_working_defibrillators', {
        for: 'select',
        to: guestRole,
        using: drizzleSql`${table.status} = 'working'`,
      }),
      pgPolicy('admin_can_manage_defibrillators', {
        for: 'all',
        to: authenticatedRole,
        using: drizzleSql`true`,
        withCheck: drizzleSql`true`,
      }),
    ],
  )
  .enableRLS();

export type Defibrillator = typeof defibrillator.$inferSelect;
export type NewDefibrillator = typeof defibrillator.$inferInsert;
