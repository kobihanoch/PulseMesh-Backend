import { sql as drizzleSql } from 'drizzle-orm';
import { pgPolicy, pgSchema, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { authenticatedRole, guestRole } from '../auth/user.schema.ts';

export const registrySchema = pgSchema('registry');

export const registrant = registrySchema
  .table(
    'registrant',
    {
      id: uuid('id').defaultRandom().primaryKey(),
      firstName: varchar('first_name', { length: 100 }).notNull(),
      lastName: varchar('last_name', { length: 100 }),
      phone: varchar('phone', { length: 30 }).notNull(),
      medicalTraining: varchar('medical_training', { length: 100 }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    () => [
      pgPolicy('guest_can_create_registrant', {
        for: 'insert',
        to: guestRole,
        withCheck: drizzleSql`true`,
      }),
      pgPolicy('admin_can_manage_registrants', {
        for: 'all',
        to: authenticatedRole,
        using: drizzleSql`true`,
        withCheck: drizzleSql`true`,
      }),
    ],
  )
  .enableRLS();

export type Registrant = typeof registrant.$inferSelect;
export type NewRegistrant = typeof registrant.$inferInsert;
