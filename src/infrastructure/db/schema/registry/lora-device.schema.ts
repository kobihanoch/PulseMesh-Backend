import { sql as drizzleSql } from 'drizzle-orm';
import { check, doublePrecision, integer, pgPolicy, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { authenticatedRole, guestRole } from '../auth/user.schema.ts';
import { defibrillator } from './defibrillator.schema.ts';
import { registrant, registrySchema } from './registrant.schema.ts';

export const loraDeviceStatus = registrySchema.enum('lora_device_status', ['active', 'inactive', 'maintenance']);

export const loraDevice = registrySchema
  .table(
    'lora_device',
    {
      id: uuid('id').defaultRandom().primaryKey(),
      ownerId: uuid('owner_id')
        .notNull()
        .references(() => registrant.id, { onDelete: 'cascade' }),
      defibrillatorId: uuid('defibrillator_id').references(() => defibrillator.id, { onDelete: 'set null' }),
      devEui: varchar('dev_eui', { length: 16 }).notNull().unique(),
      status: loraDeviceStatus('status').notNull().default('active'),
      batteryPercentage: integer('battery_percentage'),
      latitude: doublePrecision('latitude'),
      longitude: doublePrecision('longitude'),
      lastTransmissionAt: timestamp('last_transmission_at', { withTimezone: true }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
      check('lora_device_battery_range', drizzleSql`${table.batteryPercentage} IS NULL OR ${table.batteryPercentage} BETWEEN 0 AND 100`),
      check('lora_device_latitude_range', drizzleSql`${table.latitude} IS NULL OR ${table.latitude} BETWEEN -90 AND 90`),
      check('lora_device_longitude_range', drizzleSql`${table.longitude} IS NULL OR ${table.longitude} BETWEEN -180 AND 180`),
      pgPolicy('guest_can_create_lora_device', {
        for: 'insert',
        to: guestRole,
        withCheck: drizzleSql`true`,
      }),
      pgPolicy('admin_can_manage_lora_devices', {
        for: 'all',
        to: authenticatedRole,
        using: drizzleSql`true`,
        withCheck: drizzleSql`true`,
      }),
    ],
  )
  .enableRLS();

export type LoraDevice = typeof loraDevice.$inferSelect;
export type NewLoraDevice = typeof loraDevice.$inferInsert;
