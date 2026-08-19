import { sql as drizzleSql } from 'drizzle-orm';
import { doublePrecision, pgPolicy, pgSchema, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
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
      latitude: doublePrecision('latitude'),
      longitude: doublePrecision('longitude'),
      lastLocationAt: timestamp('last_location_at', { withTimezone: true }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
      pgPolicy('guest_can_create_registrant', {
        for: 'insert',
        to: guestRole,
        withCheck: drizzleSql`true`,
      }),
      pgPolicy('guest_can_update_registrant_location', {
        for: 'update',
        to: guestRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.registrant_id', true), '')::uuid`,
        withCheck: drizzleSql`${table.id} = NULLIF(current_setting('app.registrant_id', true), '')::uuid
          AND ${table.latitude} IS NOT NULL AND ${table.longitude} IS NOT NULL`,
      }),
      pgPolicy('guest_can_read_current_registrant', {
        for: 'select',
        to: guestRole,
        using: drizzleSql`${table.id} = NULLIF(current_setting('app.registrant_id', true), '')::uuid`,
      }),
      pgPolicy('guest_can_read_located_registrants', {
        for: 'select',
        to: guestRole,
        using: drizzleSql`${table.latitude} IS NOT NULL AND ${table.longitude} IS NOT NULL`,
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
