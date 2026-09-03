import { supabase } from '../lib/supabase';

export interface PlatformPublicStats {
  totalVisitors: number;
  totalGamePlays: number;
  museumPlays: number;
  canopyPlays: number;
}

const STORAGE_KEY_VISITORS = 'at30_real_visitors_count_v2';
const STORAGE_KEY_PLAYS = 'at30_real_plays_count_v2';
const STORAGE_KEY_MUSEUM = 'at30_real_museum_count_v2';
const SESSION_VISIT_KEY = 'at30_session_visit_tallied_v2';
const SESSION_GAME_KEY = 'at30_session_game_tallied_v2';

// Baseline fallback counts when database is initializing
const BASE_VISITORS = 10;
const BASE_TOTAL_PLAYS = 10;
const BASE_MUSEUM_PLAYS = 10;

class VisitorStatsService {
  private static instance: VisitorStatsService | null = null;
  private currentStats: PlatformPublicStats;
  private listeners: Set<(stats: PlatformPublicStats) => void> = new Set();
  private hasTalliedVisit: boolean = false;
  private hasTalliedGame: boolean = false;

  private constructor() {
    // Purge legacy mock storage keys if present
    try {
      localStorage.removeItem('at30_real_visitors_count_v1');
      localStorage.removeItem('at30_real_plays_count_v1');
      localStorage.removeItem('at30_real_museum_count_v1');
      localStorage.removeItem('at30_total_visitors');
      localStorage.removeItem('at30_total_plays');
    } catch {}

    this.currentStats = this.loadInitialStats();
  }

  public static getInstance(): VisitorStatsService {
    if (!VisitorStatsService.instance) {
      VisitorStatsService.instance = new VisitorStatsService();
    }
    return VisitorStatsService.instance;
  }

  private loadInitialStats(): PlatformPublicStats {
    let savedVisitors = parseInt(localStorage.getItem(STORAGE_KEY_VISITORS) || '0', 10);
    let savedPlays = parseInt(localStorage.getItem(STORAGE_KEY_PLAYS) || '0', 10);
    let savedMuseum = parseInt(localStorage.getItem(STORAGE_KEY_MUSEUM) || '0', 10);

    return {
      totalVisitors: savedVisitors > 0 ? savedVisitors : BASE_VISITORS,
      totalGamePlays: savedPlays > 0 ? savedPlays : BASE_TOTAL_PLAYS,
      museumPlays: savedMuseum > 0 ? savedMuseum : BASE_MUSEUM_PLAYS,
      canopyPlays: Math.max(0, (savedPlays || BASE_TOTAL_PLAYS) - (savedMuseum || BASE_MUSEUM_PLAYS))
    };
  }


  public getStats(): PlatformPublicStats {
    return { ...this.currentStats };
  }

  public subscribe(callback: (stats: PlatformPublicStats) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStats());
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const stats = this.getStats();
    this.listeners.forEach((cb) => cb(stats));
  }

  /**
   * Fetch current public stats from Supabase or fallback cache.
   */
  public async fetchStats(): Promise<PlatformPublicStats> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('platform_stats')
          .select('metric_key, value');

        if (!error && data && data.length > 0) {
          const map: Record<string, number> = {};
          data.forEach((row: { metric_key: string; value: number }) => {
            map[row.metric_key] = Number(row.value);
          });

          this.currentStats = {
            totalVisitors: typeof map['total_site_visits'] === 'number' ? map['total_site_visits'] : this.currentStats.totalVisitors,
            totalGamePlays: typeof map['total_game_plays'] === 'number' ? map['total_game_plays'] : this.currentStats.totalGamePlays,
            museumPlays: typeof map['museum_game_plays'] === 'number' ? map['museum_game_plays'] : this.currentStats.museumPlays,
            canopyPlays: typeof map['canopy_game_plays'] === 'number' ? map['canopy_game_plays'] : this.currentStats.canopyPlays
          };

          this.persistLocally();
          this.notify();
          return this.getStats();
        }
      } catch {
        // Continue with local cache
      }
    }

    return this.getStats();
  }

  /**
   * Records a website visit (deduplicated per browser session).
   */
  public async recordSiteVisit(): Promise<PlatformPublicStats> {
    if (this.hasTalliedVisit || sessionStorage.getItem(SESSION_VISIT_KEY)) {
      return this.fetchStats();
    }

    this.hasTalliedVisit = true;
    sessionStorage.setItem(SESSION_VISIT_KEY, 'true');

    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('record_public_visit');
        if (!error && data) {
          if (typeof data.total_site_visits === 'number') {
            this.currentStats.totalVisitors = Number(data.total_site_visits);
          }
          if (typeof data.total_game_plays === 'number') {
            this.currentStats.totalGamePlays = Number(data.total_game_plays);
          }
          this.persistLocally();
          this.notify();
          return this.getStats();
        }
      } catch {
        // Fallback below
      }
    }

    // Local increment fallback
    this.currentStats.totalVisitors += 1;
    this.persistLocally();
    this.notify();
    return this.getStats();
  }

  /**
   * Records a game play when a visitor enters the museum or canopy experience.
   */
  public async recordGamePlay(experience: 'museum' | 'canopy_run' = 'museum'): Promise<PlatformPublicStats> {
    const sessionKey = `${SESSION_GAME_KEY}_${experience}`;
    if (this.hasTalliedGame || sessionStorage.getItem(sessionKey)) {
      return this.getStats();
    }

    this.hasTalliedGame = true;
    sessionStorage.setItem(sessionKey, 'true');

    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('record_game_play', {
          experience_key: experience
        });
        if (!error && data) {
          if (typeof data.total_game_plays === 'number') {
            this.currentStats.totalGamePlays = Number(data.total_game_plays);
          }
          if (typeof data.experience_plays === 'number') {
            if (experience === 'museum') {
              this.currentStats.museumPlays = Number(data.experience_plays);
            } else {
              this.currentStats.canopyPlays = Number(data.experience_plays);
            }
          }
          this.persistLocally();
          this.notify();
          return this.getStats();
        }
      } catch {
        // Fallback below
      }
    }

    // Local increment fallback
    this.currentStats.totalGamePlays += 1;
    if (experience === 'museum') {
      this.currentStats.museumPlays += 1;
    } else {
      this.currentStats.canopyPlays += 1;
    }

    this.persistLocally();
    this.notify();
    return this.getStats();
  }

  private persistLocally() {
    try {
      localStorage.setItem(STORAGE_KEY_VISITORS, this.currentStats.totalVisitors.toString());
      localStorage.setItem(STORAGE_KEY_PLAYS, this.currentStats.totalGamePlays.toString());
      localStorage.setItem(STORAGE_KEY_MUSEUM, this.currentStats.museumPlays.toString());
    } catch {
      // Storage unavailable
    }
  }
}

export const visitorStats = VisitorStatsService.getInstance();
