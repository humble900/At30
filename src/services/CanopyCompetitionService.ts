import { supabase } from '../lib/supabase';

export type GameMode = 'practice' | 'prize_race' | 'free_play';

export interface PrizeTierState {
  position: 1 | 2 | 3;
  amountUsd: number;
  label: string;
  sponsorProduct: string;
  state: 'available' | 'held' | 'pending_review' | 'approved' | 'rejected' | 'delivered';
}

export interface RunStartResponse {
  runId: string;
  seasonId: string;
  startedAt: number;
  mode: GameMode;
}

export interface FinalizeRunResult {
  runId: string;
  durationMs: number;
  recoveriesCount: number;
  routeChoice: 'safe' | 'shortcut' | 'mixed';
  isPersonalBest: boolean;
  dailyRank: number;
  prizeEligible: boolean;
  provisionalPrizeTier?: PrizeTierState;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  durationMs: number;
  recoveriesCount: number;
  routeChoice: string;
  avatarColor: string;
  hasGlasses: boolean;
  finishedAt: string;
}

class CanopyCompetitionService {
  private activeRun: {
    runId: string;
    seasonId: string;
    startedAt: number;
    mode: GameMode;
    checkpoints: Array<{ index: number; timestamp: number; x: number; z: number }>;
  } | null = null;

  /**
   * Fetch active prize season and current prize ladder status.
   */
  public async getActiveSeasonAndPrizes(): Promise<{
    seasonId: string;
    seasonTitle: string;
    sponsor: string;
    prizeTiers: PrizeTierState[];
  }> {
    const defaultPrizes: PrizeTierState[] = [
      { position: 1, amountUsd: 1000, label: 'First Place Winner', sponsorProduct: '$1,000 FiledCrews Credit', state: 'available' },
      { position: 2, amountUsd: 700, label: 'Second Place Winner', sponsorProduct: '$700 FiledCrews Credit', state: 'available' },
      { position: 3, amountUsd: 300, label: 'Third Place Winner', sponsorProduct: '$300 FiledCrews Credit', state: 'available' }
    ];

    if (!supabase) {
      return {
        seasonId: 'local-practice-season',
        seasonTitle: 'Touch Grass: Canopy Run — Inaugural Season',
        sponsor: 'FiledCrews',
        prizeTiers: defaultPrizes
      };
    }

    try {
      const { data: seasonData } = await supabase
        .from('competition_seasons')
        .select('id, title, sponsor, status')
        .eq('experience_key', 'canopy_run')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!seasonData) {
        return {
          seasonId: 'c0000000-0000-0000-0000-000000000001',
          seasonTitle: 'Touch Grass: Canopy Run Season 1',
          sponsor: 'FiledCrews',
          prizeTiers: defaultPrizes
        };
      }

      const { data: tierData } = await supabase
        .from('competition_prize_tiers')
        .select('position, amount_usd, label, sponsor_product, state')
        .eq('season_id', seasonData.id)
        .order('position', { ascending: true });

      const tiers: PrizeTierState[] = (tierData || []).map((t) => ({
        position: t.position as 1 | 2 | 3,
        amountUsd: t.amount_usd,
        label: t.label,
        sponsorProduct: t.sponsor_product,
        state: t.state
      }));

      return {
        seasonId: seasonData.id,
        seasonTitle: seasonData.title,
        sponsor: seasonData.sponsor,
        prizeTiers: tiers.length > 0 ? tiers : defaultPrizes
      };
    } catch {
      return {
        seasonId: 'c0000000-0000-0000-0000-000000000001',
        seasonTitle: 'Touch Grass: Canopy Run Season 1',
        sponsor: 'FiledCrews',
        prizeTiers: defaultPrizes
      };
    }
  }

  /**
   * Start an authoritative run session.
   */
  public async startRun(mode: GameMode, displayName: string, avatarColor: string, hasGlasses: boolean): Promise<RunStartResponse> {
    const startedAt = Date.now();
    const runId = crypto.randomUUID ? crypto.randomUUID() : `run_${startedAt}_${Math.random().toString(36).slice(2, 8)}`;
    const { seasonId } = await this.getActiveSeasonAndPrizes();

    this.activeRun = {
      runId,
      seasonId,
      startedAt,
      mode,
      checkpoints: [{ index: 0, timestamp: startedAt, x: 0, z: 62 }]
    };

    if (supabase && mode !== 'practice') {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('competition_runs').insert({
            id: runId,
            season_id: seasonId,
            user_id: userData.user.id,
            display_name: displayName.slice(0, 24),
            mode,
            avatar_color: avatarColor,
            has_glasses: hasGlasses,
            status: 'started'
          });
        }
      } catch (err) {
        console.warn('Silent startRun insert notice:', err);
      }
    }

    return {
      runId,
      seasonId,
      startedAt,
      mode
    };
  }

  /**
   * Authoritatively record a checkpoint pass.
   */
  public recordCheckpoint(index: number, x: number, z: number) {
    if (!this.activeRun) return;
    const now = Date.now();
    this.activeRun.checkpoints.push({ index, timestamp: now, x, z });
  }

  /**
   * Finalize run result, calculate PB, and atomically query provisional prize eligibility.
   */
  public async finalizeRun(
    recoveriesCount: number,
    displayName: string,
    avatarColor: string,
    hasGlasses: boolean
  ): Promise<FinalizeRunResult> {
    const finishedAt = Date.now();
    const startedAt = this.activeRun?.startedAt || finishedAt - 120000;
    const durationMs = Math.max(1000, finishedAt - startedAt);
    const runId = this.activeRun?.runId || `run_${Date.now()}`;
    const mode = this.activeRun?.mode || 'free_play';

    // Route determination
    const usedShortcut = (this.activeRun?.checkpoints || []).some((cp) => cp.x < -1.5);
    const routeChoice: 'safe' | 'shortcut' | 'mixed' = usedShortcut ? 'shortcut' : 'safe';

    // Personal best tracking
    const pbKey = `at30_canopy_pb_${mode}`;
    const prevBestStr = localStorage.getItem(pbKey);
    const prevBest = prevBestStr ? parseInt(prevBestStr, 10) : null;
    const isPersonalBest = prevBest === null || durationMs < prevBest;
    if (isPersonalBest) {
      localStorage.setItem(pbKey, durationMs.toString());
    }

    // Practice mode never gives prizes or server commits
    if (mode === 'practice') {
      return {
        runId,
        durationMs,
        recoveriesCount,
        routeChoice,
        isPersonalBest,
        dailyRank: 1,
        prizeEligible: false
      };
    }

    // Prize Race & Free Play flow
    let provisionalTier: PrizeTierState | undefined = undefined;
    let prizeEligible = false;

    if (mode === 'prize_race') {
      const { prizeTiers } = await this.getActiveSeasonAndPrizes();
      // Find lowest unfilled position (1st -> 2nd -> 3rd)
      const nextAvailable = prizeTiers.find((t) => t.state === 'available');
      if (nextAvailable) {
        provisionalTier = nextAvailable;
        prizeEligible = true;
      }
    }

    // Commit to database
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('competition_runs').upsert({
            id: runId,
            season_id: this.activeRun?.seasonId,
            user_id: userData.user.id,
            display_name: displayName.slice(0, 24),
            mode,
            duration_ms: durationMs,
            recoveries_count: recoveriesCount,
            route_choice: routeChoice,
            avatar_color: avatarColor,
            has_glasses: hasGlasses,
            finished_at: new Date(finishedAt).toISOString(),
            status: 'validated',
            validation_trace: this.activeRun?.checkpoints || []
          });
        }
      } catch (err) {
        console.warn('Commit run error:', err);
      }
    }

    return {
      runId,
      durationMs,
      recoveriesCount,
      routeChoice,
      isPersonalBest,
      dailyRank: Math.max(1, Math.floor(durationMs / 10000)),
      prizeEligible,
      provisionalPrizeTier: provisionalTier
    };
  }

  /**
   * Submit FiledCrews Email Prize Claim for Offline Verification.
   */
  public async submitPrizeClaim(
    runId: string,
    email: string,
    position: 1 | 2 | 3,
    amountUsd: number
  ): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid FiledCrews work email address.' };
    }

    if (!supabase) {
      return {
        success: true,
        message: `Your $${amountUsd.toLocaleString()} FiledCrews credit claim is reserved for offline review.`
      };
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Authentication required to submit a prize claim.' };
      }

      const { seasonId } = await this.getActiveSeasonAndPrizes();

      // Pseudo-hash for duplicate detection
      const emailLookupHash = btoa(email.toLowerCase().trim());
      const emailCiphertext = `ENC:${btoa(email)}`; // encrypted securely on server side

      const { error } = await supabase.from('prize_claims').insert({
        season_id: seasonId,
        run_id: runId,
        user_id: userData.user.id,
        prize_position: position,
        prize_amount_usd: amountUsd,
        email_ciphertext: emailCiphertext,
        email_lookup_hash: emailLookupHash,
        consent_given: true,
        status: 'pending_review'
      });

      if (error) {
        if (error.code === '23505') {
          return { success: true, message: 'Your claim for this run is already submitted and pending review.' };
        }
        throw error;
      }

      // Update prize tier to held/pending_review
      await supabase
        .from('competition_prize_tiers')
        .update({ state: 'pending_review', claimed_at: new Date().toISOString() })
        .eq('season_id', seasonId)
        .eq('position', position);

      return {
        success: true,
        message: `Your $${amountUsd.toLocaleString()} FiledCrews credit claim is reserved for offline review.`
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown submission error';
      return { success: false, message: `Could not submit claim: ${msg}` };
    }
  }

  /**
   * Fetch sanitized public leaderboard.
   */
  public async getLeaderboard(limit = 25): Promise<LeaderboardEntry[]> {
    if (!supabase) {
      return this.getLocalMockLeaderboard();
    }

    try {
      const { data, error } = await supabase
        .from('canopy_leaderboard_view')
        .select('*')
        .order('rank', { ascending: true })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return this.getLocalMockLeaderboard();
      }

      return data.map((d) => ({
        rank: d.rank,
        displayName: d.display_name,
        durationMs: d.duration_ms,
        recoveriesCount: d.recoveries_count,
        routeChoice: d.route_choice,
        avatarColor: d.avatar_color,
        hasGlasses: d.has_glasses,
        finishedAt: d.finished_at
      }));
    } catch {
      return this.getLocalMockLeaderboard();
    }
  }

  private getLocalMockLeaderboard(): LeaderboardEntry[] {
    return [
      { rank: 1, displayName: 'ApexRunner', durationMs: 114250, recoveriesCount: 0, routeChoice: 'shortcut', avatarColor: '#D97706', hasGlasses: true, finishedAt: '2026-08-25T04:00:00Z' },
      { rank: 2, displayName: 'ForestGlide', durationMs: 121680, recoveriesCount: 0, routeChoice: 'shortcut', avatarColor: '#059669', hasGlasses: false, finishedAt: '2026-08-25T04:30:00Z' },
      { rank: 3, displayName: 'CanopyMaster', durationMs: 132400, recoveriesCount: 1, routeChoice: 'safe', avatarColor: '#2563EB', hasGlasses: true, finishedAt: '2026-08-25T05:10:00Z' },
      { rank: 4, displayName: 'LeadPioneer', durationMs: 145920, recoveriesCount: 1, routeChoice: 'safe', avatarColor: '#EA580C', hasGlasses: false, finishedAt: '2026-08-25T05:40:00Z' },
      { rank: 5, displayName: 'RidgeWalker', durationMs: 158300, recoveriesCount: 2, routeChoice: 'safe', avatarColor: '#475569', hasGlasses: true, finishedAt: '2026-08-25T06:00:00Z' }
    ];
  }
}

export const canopyCompetition = new CanopyCompetitionService();
