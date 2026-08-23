import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AvatarSpeechMessage, MultiplayerConnectionState, PlayerPresence, PlayerTransformMessage } from './types';
import { isValidTransform, normalizeSpeech } from './types';

interface MultiplayerCallbacks {
  onStateChange: (state: MultiplayerConnectionState) => void;
  onPresenceSync: (players: PlayerPresence[]) => void;
  onTransform: (message: PlayerTransformMessage) => void;
  onSpeech: (message: AvatarSpeechMessage) => void;
}

export class MultiplayerManager {
  private channel: RealtimeChannel | null = null;
  private sequence = 0;
  private lastTransformSentAt = 0;
  private lastSpeechSentAt = 0;
  private readonly sessionId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  private readonly callbacks: MultiplayerCallbacks;

  constructor(callbacks: MultiplayerCallbacks) { this.callbacks = callbacks; }

  getSessionId() { return this.sessionId; }

  async connect(displayName: string, avatarColor: string) {
    if (!supabase) { this.callbacks.onStateChange('offline'); return; }
    this.callbacks.onStateChange('connecting');
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData.session?.user;
    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) { this.callbacks.onStateChange('offline'); return; }
      user = data.user;
    }

    const presence: PlayerPresence = {
      userId: user.id, sessionId: this.sessionId, displayName: displayName.slice(0, 24),
      avatarColor, joinedAt: new Date().toISOString(),
    };

    this.channel = supabase.channel('museum:public:lobby', {
      config: { presence: { key: this.sessionId }, broadcast: { self: false, ack: false }, private: false },
    });
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState<PlayerPresence>() ?? {};
        const players = Object.values(state).flat().filter((player) => player.sessionId !== this.sessionId);
        this.callbacks.onPresenceSync(players);
      })
      .on('broadcast', { event: 'transform' }, ({ payload }) => {
        if (isValidTransform(payload) && payload.sessionId !== this.sessionId) this.callbacks.onTransform(payload);
      })
      .on('broadcast', { event: 'speech' }, ({ payload }) => {
        const message = normalizeSpeech(payload);
        if (message && message.sessionId !== this.sessionId && (!message.targetSessionId || message.targetSessionId === this.sessionId)) this.callbacks.onSpeech(message);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.channel?.track(presence);
          this.callbacks.onStateChange('online');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.callbacks.onStateChange('reconnecting');
        } else if (status === 'CLOSED') {
          this.callbacks.onStateChange('offline');
        }
      });
  }

  sendTransform(message: Omit<PlayerTransformMessage, 'version' | 'sessionId' | 'sequence' | 'sentAt'>) {
    const now = Date.now();
    if (!this.channel || now - this.lastTransformSentAt < 100) return;
    this.lastTransformSentAt = now;
    void this.channel.send({ type: 'broadcast', event: 'transform', payload: { ...message, version: 1, sessionId: this.sessionId, sequence: ++this.sequence, sentAt: now } satisfies PlayerTransformMessage });
  }

  sendSpeech(rawText: string, position: { x: number; y: number; z: number }, targetSessionId?: string | null) {
    const now = Date.now();
    const text = rawText.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
    if (!this.channel || !text || now - this.lastSpeechSentAt < 2000) return false;
    this.lastSpeechSentAt = now;
    const payload: AvatarSpeechMessage = { version: 1, sessionId: this.sessionId, text, sentAt: now, expiresAt: now + 6000, position, targetSessionId: targetSessionId || null };
    void this.channel.send({ type: 'broadcast', event: 'speech', payload });
    return true;
  }

  async disconnect() {
    if (!supabase || !this.channel) return;
    await this.channel.untrack();
    await supabase.removeChannel(this.channel);
    this.channel = null;
  }
}
