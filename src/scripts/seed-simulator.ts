import dotenv from 'dotenv';
import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { defibrillator, type NewDefibrillator } from '../infrastructure/db/schema/registry/defibrillator.schema.ts';
import { loraDevice, type NewLoraDevice } from '../infrastructure/db/schema/registry/lora-device.schema.ts';
import { registrant, type NewRegistrant } from '../infrastructure/db/schema/registry/registrant.schema.ts';

const nodeEnv = process.argv[2] ?? process.env.NODE_ENV ?? 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

const databaseUrl = process.env.SEED_DATABASE_URL ?? process.env.MIGRATION_DATABASE_URL;
if (!databaseUrl) throw new Error('SEED_DATABASE_URL or MIGRATION_DATABASE_URL is required');

const client = postgres(databaseUrl, { ssl: nodeEnv === 'production' ? 'require' : false });
const db = drizzle(client);

const count = 50;
const registrants: NewRegistrant[] = [];
const defibrillators: NewDefibrillator[] = [];
const loraDevices: NewLoraDevice[] = [];

for (let index = 1; index <= count; index++) {
  const suffix = String(index).padStart(12, '0');
  const ownerId = `10000000-0000-4000-8000-${suffix}`;
  const defibrillatorId = `20000000-0000-4000-8000-${suffix}`;
  const hasDefibrillator = index <= 45;
  const hasLora = index <= 35 || index > 45;

  registrants.push({
    id: ownerId,
    firstName: `Simulator ${index}`,
    phone: `050900${String(index).padStart(4, '0')}`,
    medicalTraining: index % 3 === 0 ? 'First aid' : null,
  });

  if (hasDefibrillator) {
    defibrillators.push({
      id: defibrillatorId,
      ownerId,
      isMobile: true,
      status: index % 10 === 0 ? 'maintenance' : index % 15 === 0 ? 'out_of_service' : 'working',
    });
  }

  if (hasLora) {
    loraDevices.push({
      id: `30000000-0000-4000-8000-${suffix}`,
      ownerId,
      defibrillatorId: hasDefibrillator ? defibrillatorId : null,
      devEui: `DEF${String(index).padStart(13, '0')}`,
      status: index % 9 === 0 ? 'inactive' : index % 13 === 0 ? 'maintenance' : 'active',
      batteryPercentage: (index * 17) % 101,
      ...locationNearHaifa(index),
      lastTransmissionAt: new Date(Date.now() - (index % 8) * 6 * 60 * 60 * 1000),
    });
  }
}

await db.transaction(async (tx) => {
  await tx.delete(registrant).where(inArray(registrant.id, registrants.map(({ id }) => id!)));
  await tx.insert(registrant).values(registrants);
  await tx.insert(defibrillator).values(defibrillators);
  await tx.insert(loraDevice).values(loraDevices);
});

await client.end();
console.log(`Seeded ${count} simulator registrations around Haifa`);

function locationNearHaifa(index: number) {
  const angle = index * 2.4;
  const distance = 0.005 + (index % 10) * 0.003;
  return {
    latitude: 32.794 + Math.sin(angle) * distance,
    longitude: 34.9896 + Math.cos(angle) * distance,
  };
}
