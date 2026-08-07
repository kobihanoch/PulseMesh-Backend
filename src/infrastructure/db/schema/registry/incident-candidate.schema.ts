import { sql as drizzleSql } from 'drizzle-orm';
import { index, integer, pgPolicy, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { authenticatedRole } from '../auth/user.schema.ts';
import { incident } from './incident.schema.ts';
import { loraDevice } from './lora-device.schema.ts';
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
      loraDeviceId: uuid('lora_device_id')
        .notNull()
        .references(() => loraDevice.id, { onDelete: 'cascade' }),
      distanceMeters: integer('distance_meters').notNull(),
      status: incidentCandidateStatus('status').notNull().default('selected'),
      notifiedAt: timestamp('notified_at', { withTimezone: true }),
      respondedAt: timestamp('responded_at', { withTimezone: true }),
      createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
      uniqueIndex('incident_candidate_incident_device_unique').on(table.incidentId, table.loraDeviceId),
      index('incident_candidate_incident_id_idx').on(table.incidentId),
      index('incident_candidate_lora_device_id_idx').on(table.loraDeviceId),
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
