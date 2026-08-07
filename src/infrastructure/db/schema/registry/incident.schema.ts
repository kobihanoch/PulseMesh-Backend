import { sql as drizzleSql } from 'drizzle-orm';
import { check, doublePrecision, integer, pgPolicy, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole, guestRole } from '../auth/user.schema.ts';
import { registrySchema } from './registrant.schema.ts';

export const incidentStatus = registrySchema.enum('incident_status', ['active', 'resolved', 'cancelled']);
export const incidentSource = registrySchema.enum('incident_source', ['app', 'emergency_center', 'simulator']);

export const incident = registrySchema
  .table(
    'incident',
    {
      id: uuid('id').defaultRandom().primaryKey(),
      source: incidentSource('source').notNull().default('simulator'),
      latitude: doublePrecision('latitude').notNull(),
      longitude: doublePrecision('longitude').notNull(),
      radiusMeters: integer('radius_meters').notNull().default(5000),
      status: incidentStatus('status').notNull().default('active'),
      description: text('description'),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
      closedAt: timestamp('closed_at', { withTimezone: true }),
    },
    (table) => [
      check('incident_latitude_range', drizzleSql`${table.latitude} BETWEEN -90 AND 90`),
      check('incident_longitude_range', drizzleSql`${table.longitude} BETWEEN -180 AND 180`),
      check('incident_radius_positive', drizzleSql`${table.radiusMeters} > 0`),
      check(
        'incident_closed_at_matches_status',
        drizzleSql`(${table.status} = 'active' AND ${table.closedAt} IS NULL) OR (${table.status} <> 'active' AND ${table.closedAt} IS NOT NULL)`,
      ),
      pgPolicy('guest_can_create_incident', {
        for: 'insert',
        to: guestRole,
        withCheck: drizzleSql`${table.status} = 'active' AND ${table.closedAt} IS NULL`,
      }),
      pgPolicy('admin_can_manage_incidents', {
        for: 'all',
        to: authenticatedRole,
        using: drizzleSql`true`,
        withCheck: drizzleSql`true`,
      }),
    ],
  )
  .enableRLS();

export type Incident = typeof incident.$inferSelect;
export type NewIncident = typeof incident.$inferInsert;
