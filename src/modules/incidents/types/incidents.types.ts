import type { Incident } from '../../../infrastructure/db/postgresql/schema/registry/incident.schema.ts';
import type { IncidentCandidate } from '../../../infrastructure/db/postgresql/schema/registry/incident-candidate.schema.ts';
import type { LoraDevice } from '../../../infrastructure/db/postgresql/schema/registry/lora-device.schema.ts';

export type IncidentStatus = Incident['status'];

export type NearbyDevice = Pick<LoraDevice, 'id' | 'devEui' | 'batteryPercentage'> & {
  latitude: NonNullable<LoraDevice['latitude']>;
  longitude: NonNullable<LoraDevice['longitude']>;
  lastTransmissionAt: NonNullable<LoraDevice['lastTransmissionAt']>;
  distanceMeters: number;
};

export type IncidentCandidateDetails = Omit<NearbyDevice, 'id'> &
  Pick<IncidentCandidate, 'status' | 'notifiedAt' | 'respondedAt'> & {
    candidateId: IncidentCandidate['id'];
    deviceId: LoraDevice['id'];
  };

export type IncidentDetails = Incident & { candidates: IncidentCandidateDetails[] };
