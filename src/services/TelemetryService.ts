import { supabase } from '../lib/supabase';
import type { BrandKey } from '../types';

export interface TelemetryPayload {
  [key: string]: unknown;
}

export interface QueuedTelemetryEvent {
  session_id: string;
  event_type: string;
  brand_key?: string | null;
  exhibit_id?: string | null;
  payload: TelemetryPayload;
  timestamp: string;
}

export interface QueuedSpatialSample {
  session_id: string;
  room_id: string;
  pos_x: number;
  pos_z: number;
  timestamp: string;
}

class TelemetryEngine {
  private sessionId: string = '';
  private visitorName: string = 'Curator';
  private avatarColor: string = '#00F0FF';
  private eventQueue: QueuedTelemetryEvent[] = [];
  private spatialQueue: QueuedSpatialSample[] = [];
  private flushTimer: number | null = null;
  private isInitialized: boolean = false;
  private sessionStartTime: number = Date.now();
  private lastSpatialTime: number = 0;
  private currentRoomId: string = 'atrium';
  private roomEnterTime: number = Date.now();
  private collectedBrands: Set<BrandKey> = new Set();
  private inspectedExhibits: Set<string> = new Set();
  private fpsSamples: number[] = [];

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushSync());
      window.addEventListener('pagehide', () => this.flushSync());
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.flushSync();
      });
    }
  }

  private getOrCreateSessionId(): string {
    let sid = sessionStorage.getItem('at30_telemetry_session_id');
    if (!sid) {
      sid = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('at30_telemetry_session_id', sid);
    }
    return sid;
  }

  public init(visitorName: string = 'Visitor', avatarColor: string = '#D9FF43') {
    this.visitorName = visitorName;
    this.avatarColor = avatarColor;
    this.sessionStartTime = Date.now();
    this.roomEnterTime = Date.now();

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.startPeriodicFlush();
    }
  }

  public trackAppInitialized() {
    this.trackEvent('app_initialized');
  }

  public trackSessionStart(visitorName: string) {
    this.visitorName = visitorName;
    this.sessionStartTime = Date.now();
    this.trackEvent('museum_session_started', null, null, { visitorName });
    void this.recordSessionStart();
  }

  public trackSessionEnd(rewardsCount: number) {
    this.trackEvent('museum_session_ended', null, null, {
      rewardsCount,
      durationSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000)
    });
    void this.finishSession();
  }

  private async ensureAuthenticatedUser(): Promise<string | null> {
    const client = supabase;
    if (!client) return null;
    const { data } = await client.auth.getSession();
    if (data.session?.user.id) return data.session.user.id;
    const { data: anonymous, error } = await client.auth.signInAnonymously();
    return error ? null : anonymous.user?.id || null;
  }

  private detectHardware() {
    if (typeof window === 'undefined') {
      return {
        deviceType: 'desktop',
        browser: 'unknown',
        os: 'unknown',
        screenResolution: 'unknown',
        gpuRenderer: 'unknown',
        inputMode: 'keyboard_mouse'
      };
    }

    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
    
    let deviceType = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    const inputMode = isMobile || isTablet || 'ontouchstart' in window ? 'touch_joystick' : 'keyboard_mouse';

    // Extract GPU renderer via WebGL debug info
    let gpuRenderer = 'unknown';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'generic_webgl';
        }
      }
    } catch {
      gpuRenderer = 'unsupported';
    }

    return {
      deviceType,
      browser: navigator.userAgent.slice(0, 80),
      os: navigator.platform || 'unknown',
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      gpuRenderer: gpuRenderer.slice(0, 100),
      inputMode
    };
  }

  private async recordSessionStart() {
    const hw = this.detectHardware();
    const userId = await this.ensureAuthenticatedUser();
    if (!userId) return;
    
    // Insert into visitor_sessions table in Supabase
    if (supabase) {
      try {
        await supabase.from('visitor_sessions').insert({
          id: this.sessionId,
          user_id: userId,
          visitor_name: this.visitorName,
          avatar_color: this.avatarColor,
          device_type: hw.deviceType,
          input_mode: hw.inputMode,
          browser: hw.browser,
          os: hw.os,
          screen_resolution: hw.screenResolution,
          gpu_renderer: hw.gpuRenderer,
          started_at: new Date(this.sessionStartTime).toISOString()
        });
      } catch {
        // Continue silently if offline
      }
    }

    this.trackEvent('session_start', null, null, {
      ...hw,
      visitorName: this.visitorName,
      avatarColor: this.avatarColor
    });
    await this.flush();
  }

  private async finishSession() {
    await this.updateSessionStats();
    if (!supabase) return;
    await supabase.from('visitor_sessions').update({
      ended_at: new Date().toISOString(),
      exited_via_portal: true,
      session_duration_seconds: Math.round((Date.now() - this.sessionStartTime) / 1000)
    }).eq('id', this.sessionId);
    await this.flush();
  }

  public trackEvent(eventType: string, brandKey?: string | null, exhibitId?: string | null, payload: TelemetryPayload = {}) {
    const event: QueuedTelemetryEvent = {
      session_id: this.sessionId,
      event_type: eventType,
      brand_key: brandKey || null,
      exhibit_id: exhibitId || null,
      payload,
      timestamp: new Date().toISOString()
    };

    this.eventQueue.push(event);

    if (this.eventQueue.length >= 15) {
      void this.flush();
    }
  }

  public trackSpatialSample(x: number, z: number) {
    const now = Date.now();
    if (now - this.lastSpatialTime < 5000) return; // Throttled to 5 seconds
    this.lastSpatialTime = now;

    // Detect which room the player is in based on coordinates
    const roomId = this.determineRoom(x, z);
    if (roomId !== this.currentRoomId) {
      const dwellSeconds = Math.round((now - this.roomEnterTime) / 1000);
      this.trackEvent('room_transition', this.getBrandFromRoom(roomId), null, {
        fromRoom: this.currentRoomId,
        toRoom: roomId,
        dwellSeconds
      });
      this.currentRoomId = roomId;
      this.roomEnterTime = now;
    }

    this.spatialQueue.push({
      session_id: this.sessionId,
      room_id: roomId,
      pos_x: Number(x.toFixed(2)),
      pos_z: Number(z.toFixed(2)),
      timestamp: new Date().toISOString()
    });

    if (this.spatialQueue.length >= 15) {
      void this.flush();
    }
  }

  private determineRoom(x: number, z: number): string {
    if (Math.abs(x) <= 10 && Math.abs(z) <= 10) return 'atrium';
    if (x > 10) {
      if (x < 28) return 'east_lobby';
      if (x < 48) return 'east_gallery';
      return 'east_sanctum'; // PosterBooking
    }
    if (z < -10) {
      if (z > -28) return 'north_lobby';
      if (z > -48) return 'north_gallery';
      return 'north_sanctum'; // ClayRent
    }
    if (x < -10) {
      if (x > -28) return 'west_lobby';
      if (x > -48) return 'west_gallery';
      return 'west_sanctum'; // LeadMagic
    }
    if (z > 10) return 'south_portal';
    return 'atrium';
  }

  private getBrandFromRoom(roomId: string): string | null {
    if (roomId.startsWith('east_')) return 'posterbooking';
    if (roomId.startsWith('north_')) return 'clayrent';
    if (roomId.startsWith('west_')) return 'leadmagic';
    return null;
  }

  public trackExhibitInspectOpened(exhibitId: string, brandKey: BrandKey, title: string) {
    this.inspectedExhibits.add(exhibitId);
    this.trackEvent('exhibit_inspect_opened', brandKey, exhibitId, { title });
  }

  public trackExhibitInspectDuration(exhibitId: string, brandKey: BrandKey, durationSeconds: number) {
    this.trackEvent('exhibit_inspect_duration', brandKey, exhibitId, { durationSeconds });
  }

  public trackCouponCopied(brandKey: BrandKey, couponCode: string) {
    this.collectedBrands.add(brandKey);
    this.trackEvent('coupon_code_copied', brandKey, null, { couponCode });
    this.updateSessionStats();
  }

  public trackBrandOutboundClicked(brandKey: BrandKey, redeemUrl: string) {
    this.trackEvent('brand_outbound_clicked', brandKey, null, { redeemUrl });
  }

  public trackPassportOpened(rewardsCount: number) {
    this.trackEvent('passport_opened', null, null, { rewardsCount });
  }

  public trackVictoryCelebration() {
    this.trackEvent('victory_modal_triggered', null, null, {
      totalTimeSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000)
    });
    this.updateSessionStats(true);
  }

  public trackExitFlow(method: 'portal' | 'button', confirmed: boolean) {
    this.trackEvent('exit_flow', null, null, { method, confirmed });
  }

  public recordFps(fps: number) {
    this.fpsSamples.push(fps);
    if (this.fpsSamples.length > 60) this.fpsSamples.shift();
  }

  public trackWebGLError(errorType: string, details: string) {
    this.trackEvent('webgl_error_caught', null, null, { errorType, details });
  }

  private async updateSessionStats(completedQuest: boolean = false) {
    if (!supabase) return;
    const avgFps = this.fpsSamples.length > 0 
      ? Math.round(this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length)
      : 60;
    
    try {
      await supabase.from('visitor_sessions').update({
        session_duration_seconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
        exhibits_inspected: Array.from(this.inspectedExhibits),
        coupons_claimed: Array.from(this.collectedBrands),
        completed_quest: completedQuest || this.collectedBrands.size >= 3,
        avg_fps: avgFps
      }).eq('id', this.sessionId);
    } catch {
      // Ignore
    }
  }

  private startPeriodicFlush() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = window.setInterval(() => {
      void this.flush();
    }, 10000);
  }

  public async flush() {
    if (!supabase || (this.eventQueue.length === 0 && this.spatialQueue.length === 0)) return;

    const eventsToFlush = [...this.eventQueue];
    const spatialToFlush = [...this.spatialQueue];
    this.eventQueue = [];
    this.spatialQueue = [];

    try {
      if (eventsToFlush.length > 0) {
        await supabase.from('telemetry_events').insert(eventsToFlush);
      }
      if (spatialToFlush.length > 0) {
        await supabase.from('spatial_samples').insert(spatialToFlush);
      }
    } catch (err) {
      // Put failed events back in queue (capped to prevent memory growth)
      if (this.eventQueue.length < 50) {
        this.eventQueue.unshift(...eventsToFlush);
      }
      if (this.spatialQueue.length < 50) {
        this.spatialQueue.unshift(...spatialToFlush);
      }
    }
  }

  public flushSync() {
    if (this.eventQueue.length === 0 && this.spatialQueue.length === 0) return;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
    const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();
    if (!supabaseUrl || !supabaseKey) return;

    // Use sendBeacon or synchronous fetch if available
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    if (events.length > 0 && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(events)], { type: 'application/json' });
      navigator.sendBeacon(`${supabaseUrl}/rest/v1/telemetry_events`, blob);
    }
  }
}

export const telemetry = new TelemetryEngine();
