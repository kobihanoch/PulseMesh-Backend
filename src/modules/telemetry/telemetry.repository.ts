export type TelemetryHistoryEntry = {
  deviceId: string;
  batteryPercentage: number;
  latitude: number;
  longitude: number;
  transmittedAt: Date;
};

/** TODO: Insert the entry into MongoDB when its connection is added. */
export async function saveTelemetryHistory(_entry: TelemetryHistoryEntry): Promise<void> {}

/** TODO: Read a device's telemetry history from MongoDB. */
export async function getTelemetryHistory(_deviceId: string): Promise<TelemetryHistoryEntry[]> {
  return [];
}
