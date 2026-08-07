import { beginTransaction } from '../../infrastructure/db/postgresql/postgresql.client.ts';
import sql from '../../infrastructure/db/postgresql/postgresql.client.ts';
import { mongoDB } from '../../infrastructure/db/mongodb/mongodb.client.ts';
import type { CreateTelemetryRequest } from './types/telemetry.request.types.ts';
import type { TelemetryHistoryEntry } from './types/telemetry.types.ts';

export async function queryUpdateDevice(input: CreateTelemetryRequest) {
  return beginTransaction(async () => {
    await sql`SET LOCAL ROLE app_authenticated`;
    const [device] = await sql<[{ id: string; devEui: string; lastTransmissionAt: Date }?]>`
      UPDATE registry.lora_device
      SET battery_percentage = ${input.batteryPercentage}, latitude = ${input.latitude},
        longitude = ${input.longitude}, last_transmission_at = NOW(), updated_at = NOW()
      WHERE dev_eui = ${input.devEui}
      RETURNING id, dev_eui AS "devEui", last_transmission_at AS "lastTransmissionAt"
    `;
    return device;
  });
}

export async function querySaveTelemetryHistory(entry: TelemetryHistoryEntry) {
  await mongoDB.collection<TelemetryHistoryEntry>('telemetry').insertOne(entry);
}
