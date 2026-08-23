export type MultiplayerConnectionState = 'offline' | 'connecting' | 'online' | 'reconnecting';

export interface PlayerPresence {
  userId: string;
  sessionId: string;
  displayName: string;
  avatarColor: string;
  joinedAt: string;
}

export interface PlayerTransformMessage {
  version: 1;
  sessionId: string;
  sequence: number;
  sentAt: number;
  position: { x: number; y: number; z: number };
  rotationY: number;
  animation: 'idle' | 'walk' | 'run' | 'jump';
}

export interface AvatarSpeechMessage {
  version: 1;
  sessionId: string;
  text: string;
  sentAt: number;
  expiresAt: number;
  position: { x: number; y: number; z: number };
  targetSessionId?: string | null;
}

export const isValidTransform = (value: unknown): value is PlayerTransformMessage => {
  if (!value || typeof value !== 'object') return false;
  const message = value as PlayerTransformMessage;
  const { position } = message;
  return message.version === 1 && typeof message.sessionId === 'string' &&
    Number.isFinite(message.sequence) && Number.isFinite(message.sentAt) &&
    Boolean(position) && Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z) &&
    Math.abs(position.x) <= 75 && position.y >= -1 && position.y <= 8 && Math.abs(position.z) <= 75 &&
    Number.isFinite(message.rotationY) && ['idle', 'walk', 'run', 'jump'].includes(message.animation);
};

export const normalizeSpeech = (value: unknown): AvatarSpeechMessage | null => {
  if (!value || typeof value !== 'object') return null;
  const message = value as AvatarSpeechMessage;
  if (message.version !== 1 || typeof message.sessionId !== 'string' || typeof message.text !== 'string') return null;
  if (!message.position || !Number.isFinite(message.position.x) || !Number.isFinite(message.position.y) || !Number.isFinite(message.position.z)) return null;
  if (message.targetSessionId != null && typeof message.targetSessionId !== 'string') return null;
  const text = message.text.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
  if (!text || !Number.isFinite(message.sentAt) || !Number.isFinite(message.expiresAt)) return null;
  return { ...message, text };
};
