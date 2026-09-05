import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Footprints,
  RotateCcw,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import type { FinalizeRunResult } from '../services/CanopyCompetitionService';
import { canopyCompetition } from '../services/CanopyCompetitionService';

interface FinishCardModalProps {
  result: FinalizeRunResult;
  visitorName: string;
  onRetry: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onExit: () => void;
}

export const FinishCardModal: React.FC<FinishCardModalProps> = ({
  result,
  visitorName,
  onRetry,
  onOpenLeaderboard,
  onOpenRules,
  onExit
}) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimError, setClaimError] = useState('');

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  const prizeTier = result.provisionalPrizeTier;
  const isPrizeEligible = result.prizeEligible && prizeTier;

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prizeTier) return;
    if (!consent) {
      setClaimError('Please consent to offline account verification with FiledCrews.');
      return;
    }

    setSubmitting(true);
    setClaimError('');

    const res = await canopyCompetition.submitPrizeClaim(
      result.runId,
      email,
      prizeTier.position,
      prizeTier.amountUsd
    );

    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      setClaimMessage(res.message);
    } else {
      setClaimError(res.message);
    }
  };

  return (
    <div className="canopy-modal-backdrop">
      <div className="canopy-finish-card">
        {/* Header Ribbon */}
        <div className="canopy-finish-header">
          <span className="canopy-finish-kicker">COURSE COMPLETED · THE BELL HAS RUNG</span>
          <h2>{visitorName} finished the Canopy Run</h2>
        </div>

        {/* Primary Time Display */}
        <div className="canopy-finish-time-box">
          <div className="canopy-finish-time">{formatTime(result.durationMs)}</div>
          <div className="canopy-finish-metrics">
            <span className="metric-pill">
              <Clock size={14} />
              {result.isPersonalBest ? '⭐ New Personal Best!' : 'Course Time'}
            </span>
            <span className="metric-pill">
              <Footprints size={14} />
              {result.recoveriesCount === 0 ? 'Clean Run (0 falls)' : `${result.recoveriesCount} Recoveries`}
            </span>
            <span className="metric-pill">
              <Flame size={14} />
              {result.routeChoice === 'shortcut' ? 'Shortcut Route Taken' : 'Scenic Safe Route'}
            </span>
          </div>
        </div>

        {/* Prize Allocation Section */}
        {isPrizeEligible ? (
          <div className="canopy-prize-box">
            {!submitted ? (
              <>
                <div className="canopy-prize-banner">
                  <Trophy size={28} className="gold-trophy" />
                  <div>
                    <span className="prize-eyebrow">PROVISIONAL PRIZE POSITION #{prizeTier.position}</span>
                    <h3>${prizeTier.amountUsd.toLocaleString()} FiledCrews Credit</h3>
                  </div>
                </div>

                <p className="canopy-prize-desc">
                  You finished in a prize position! Enter the work email you use with FiledCrews to reserve your provisional credit claim.
                </p>

                <form onSubmit={handleSubmitClaim} className="canopy-claim-form">
                  <div className="canopy-input-group">
                    <label htmlFor="filedcrews-email">FiledCrews Work Email</label>
                    <input
                      id="filedcrews-email"
                      type="email"
                      required
                      placeholder="your.name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <label className="canopy-consent-label">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      required
                    />
                    <span>
                      I agree to submit my work email for offline verification by FiledCrews and Any30 under the{' '}
                      <button type="button" className="inline-link" onClick={onOpenRules}>
                        Official Rules
                      </button>.
                    </span>
                  </label>

                  {claimError && <div className="canopy-claim-error">{claimError}</div>}

                  <button
                    type="submit"
                    className="canopy-submit-claim-btn"
                    disabled={submitting || !consent}
                  >
                    {submitting ? 'Reserving Claim…' : `Submit Provisional $${prizeTier.amountUsd.toLocaleString()} Claim`}
                  </button>
                </form>
              </>
            ) : (
              <div className="canopy-claim-success">
                <CheckCircle2 size={36} className="success-icon" />
                <h3>Claim Reserved for Review</h3>
                <p>{claimMessage}</p>
                <div className="canopy-review-notice">
                  <ShieldCheck size={16} />
                  <span>FiledCrews verifies accounts offline. Results will be confirmed directly.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="canopy-nonprize-box">
            <div className="canopy-nonprize-header">
              <Award size={22} />
              <div>
                <strong>Leaderboard Entry Recorded</strong>
                <p>All provisional prize positions are currently under offline review. Your verified time is posted to the leaderboard.</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Action Buttons */}
        <div className="canopy-finish-actions">
          <button className="canopy-btn primary" onClick={onRetry}>
            <RotateCcw size={18} />
            <span>Race Again</span>
          </button>
          <button className="canopy-btn secondary" onClick={onOpenLeaderboard}>
            <Trophy size={18} />
            <span>Leaderboard</span>
          </button>
          <button className="canopy-btn text-only" onClick={onExit}>
            <span>Return to Any30</span>
          </button>
        </div>
      </div>
    </div>
  );
};
