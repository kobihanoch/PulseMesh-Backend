import type { Defibrillator } from '../../../infrastructure/db/postgresql/schema/registry/defibrillator.schema.ts';
import type { IncidentCandidate } from '../../../infrastructure/db/postgresql/schema/registry/incident-candidate.schema.ts';
import type { Incident } from '../../../infrastructure/db/postgresql/schema/registry/incident.schema.ts';
import type { LoraDevice } from '../../../infrastructure/db/postgresql/schema/registry/lora-device.schema.ts';
import type { Registrant } from '../../../infrastructure/db/postgresql/schema/registry/registrant.schema.ts';
import type { NotificationChannels } from '../../notifications/notifications.types.ts';

export type IncidentStatus = Incident['status'];

export type NearbyDevice = {
  defibrillatorId: Defibrillator['id'];
  registrantId: Registrant['id'];
  loraDeviceId: LoraDevice['id'] | null;
  devEui: LoraDevice['devEui'] | null;
  batteryPercentage: LoraDevice['batteryPercentage'];
  latitude: number;
  longitude: number;
  lastTransmissionAt: Date;
  distanceMeters: number;
};

export type IncidentCandidateDetails = NearbyDevice &
  Pick<IncidentCandidate, 'status' | 'notifiedAt' | 'respondedAt'> & {
    candidateId: IncidentCandidate['id'];
    notifications: NotificationChannels;
  };

export type IncidentDetails = Incident & { candidates: IncidentCandidateDetails[] };
