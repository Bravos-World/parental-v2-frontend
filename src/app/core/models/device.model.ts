export interface Device {
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  status: 'ONLINE' | 'OFFLINE';
  lockStatus: 'LOCKED' | 'UNLOCKED';
  lastSeen: string;
  createdAt: string;
}

export interface DeviceEvent {
  id: number;
  deviceId: string;
  deviceName: string;
  eventType: string;
  description: string;
  timestamp: string;
}

export type CommandType = 'LOCK' | 'UNLOCK' | 'SHUTDOWN' | 'RESTART';

export interface CommandRequest {
  commandType: CommandType;
  delaySeconds: number;
}

export interface MessageRequest {
  message: string;
}
