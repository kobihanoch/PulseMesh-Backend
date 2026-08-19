import type { Defibrillator } from '../../../infrastructure/db/postgresql/schema/registry/defibrillator.schema.ts';
import type { LoraDevice } from '../../../infrastructure/db/postgresql/schema/registry/lora-device.schema.ts';
import type { Registrant } from '../../../infrastructure/db/postgresql/schema/registry/registrant.schema.ts';

export type RegistrantQueryResult = Registrant;
export type DefibrillatorQueryResult = Defibrillator;
export type LoraDeviceQueryResult = LoraDevice;
export type RegistrationQueryResult = RegistrantQueryResult & {
  defibrillators: DefibrillatorQueryResult[];
  loraDevices: LoraDeviceQueryResult[];
};
export type RegistrationsCountQueryResult = { totalItems: number };
export type DeletedRegistrantQueryResult = Pick<Registrant, 'id'>;
export type DefibrillatorsByOwner = Record<Registrant['id'], DefibrillatorQueryResult[]>;
export type LoraDevicesByOwner = Record<Registrant['id'], LoraDeviceQueryResult[]>;
export type DefibrillatorsByOwnerQueryResult = { devicesByOwner: DefibrillatorsByOwner };
export type LoraDevicesByOwnerQueryResult = { devicesByOwner: LoraDevicesByOwner };
