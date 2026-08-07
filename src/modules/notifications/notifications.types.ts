export type SimulatedNotification = {
  type: 'incident' | 'low_battery';
  channel: 'push' | 'lora';
  status: 'simulated';
  registrantId: string;
  deviceId: string;
  incidentId?: string;
  createdAt: Date;
};

export type NotificationChannels = {
  push: 'simulated';
  lora: 'simulated' | 'unavailable';
};
