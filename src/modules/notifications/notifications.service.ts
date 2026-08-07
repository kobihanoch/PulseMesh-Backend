import { querySaveNotifications } from './notifications.repository.ts';
import type { NotificationChannels } from './notifications.types.ts';

export async function simulateIncidentNotifications(
  incidentId: string,
  candidates: Array<{ registrantId: string; defibrillatorId: string; loraDeviceId: string | null }>,
) {
  const createdAt = new Date();
  await querySaveNotifications(
    candidates.flatMap((candidate) => [
      {
        type: 'incident' as const,
        channel: 'push' as const,
        status: 'simulated' as const,
        registrantId: candidate.registrantId,
        deviceId: candidate.defibrillatorId,
        incidentId,
        createdAt,
      },
      ...(candidate.loraDeviceId
        ? [
            {
              type: 'incident' as const,
              channel: 'lora' as const,
              status: 'simulated' as const,
              registrantId: candidate.registrantId,
              deviceId: candidate.loraDeviceId,
              incidentId,
              createdAt,
            },
          ]
        : []),
    ]),
  );
}

export async function simulateLowBatteryNotification(registrantId: string, deviceId: string) {
  await querySaveNotifications([
    {
      type: 'low_battery',
      channel: 'push',
      status: 'simulated',
      registrantId,
      deviceId,
      createdAt: new Date(),
    },
  ]);
}

export function getNotificationChannels(hasLora: boolean): NotificationChannels {
  return { push: 'simulated', lora: hasLora ? 'simulated' : 'unavailable' };
}
