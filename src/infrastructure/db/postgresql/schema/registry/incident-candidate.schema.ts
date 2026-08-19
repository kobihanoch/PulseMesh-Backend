import { sql as drizzleSql } from 'drizzle-orm';
import { index, integer, pgPolicy, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole, guestRole } from '../auth/user.schema.ts';
import { incident } from './incident.schema.ts';
import { loraDevice } from './lora-device.schema.ts';
import { defibrillator } from './defibrillator.schema.ts';
import { registrySchema } from './registrant.schema.ts';

export const incidentCandidateStatus = registrySchema.enum('incident_candidate_status', ['selected', 'notified', 'accepted', 'declined', 'failed']);

export const incidentCandidate = registrySchema
  .table(
    'incident_candidate',
    {
      id: uuid('id').defaultRandom().primaryKey(),
      incidentId: uuid('incident_id')
        .notNull()
        .references(() => incident.id, { onDelete: 'cascade' }),
      defibrillatorId: uuid('defibrillator_id')
        .notNull()
        .references(() => defibrillator.id, { onDelete: 'cascade' }),
      loraDeviceId: uuid('lora_device_id').references(() => loraDevice.id, { onDelete: 'set null' }),
      distanceMeters: integer('distance_meters').notNull(),
      status: incidentCandidateStatus('status').notNull().default('selected'),
      notifiedAt: timestamp('notified_at', { withTimezone: true }),
      respondedAt: timestamp('responded_at', { withTimezone: true }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
      uniqueIndex('incident_candidate_incident_defibrillator_unique').on(table.incidentId, table.defibrillatorId),
      index('incident_candidate_incident_id_idx').on(table.incidentId),
      index('incident_candidate_lora_device_id_idx').on(table.loraDeviceId),
      index('incident_candidate_defibrillator_id_idx').on(table.defibrillatorId),
      pgPolicy('guest_can_create_incident_candidates', {
        for: 'insert',
        to: guestRole,
        withCheck: drizzleSql`true`,
      }),
      pgPolicy('guest_can_read_incident_candidates', {
        for: 'select',
        to: guestRole,
        using: drizzleSql`${table.status} IN ('notified', 'accepted', 'declined')`,
      }),
      pgPolicy('guest_can_respond_to_incident_candidates', {
        for: 'update',
        to: guestRole,
        using: drizzleSql`${table.status} = 'notified'`,
        withCheck: drizzleSql`${table.status} IN ('accepted', 'declined')`,
      }),
      pgPolicy('admin_can_manage_incident_candidates', {
        for: 'all',
        to: authenticatedRole,
        using: drizzleSql`true`,
        withCheck: drizzleSql`true`,
      }),
    ],
  )
  .enableRLS();

export type IncidentCandidate = typeof incidentCandidate.$inferSelect;
export type NewIncidentCandidate = typeof incidentCandidate.$inferInsert;
