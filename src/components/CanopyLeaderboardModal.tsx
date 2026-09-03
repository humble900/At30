import React, { useEffect, useState } from 'react';
import { Award, Clock, Flame, Footprints, RefreshCw, Trophy, X } from 'lucide-react';
import type { LeaderboardEntry } from '../services/CanopyCompetitionService';
import { canopyCompetition } from '../services/CanopyCompetitionService';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const CanopyLeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await canopyCompetition.getLeaderboard(20);
    setEntries(data);
    setLoading(false);
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  return (
    <div className="canopy-modal-backdrop">
      <div className="canopy-leaderboard-modal">
        <div className="canopy-modal-head">
          <div className="title-wrap">
            <Trophy size={24} className="gold-trophy" />
            <div>
              <h2>Canopy Run Leaderboard</h2>
              <p>Top verified obstacle course finishing times</p>
            </div>
          </div>
          <button className="canopy-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="canopy-leaderboard-list">
          {loading ? (
            <div className="canopy-loading-state">
              <RefreshCw size={24} className="spin" />
              <span>Fetching verified leaderboard times…</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="canopy-empty-state">
              <Award size={32} />
              <p>No verified runs yet. Be the first to complete the Canopy Run!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={`${entry.rank}-${entry.displayName}`} className={`canopy-lb-row rank-${entry.rank}`}>
                <div className="lb-rank">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </div>

                <div className="lb-player">
                  <span className="avatar-dot" style={{ backgroundColor: entry.avatarColor }} />
                  <strong>{entry.displayName}</strong>
                </div>

                <div className="lb-meta">
                  <span className="route-tag" title={entry.routeChoice}>
                    {entry.routeChoice === 'shortcut' ? <Flame size={12} /> : null}
                    {entry.routeChoice}
                  </span>
                  <span className="recoveries-tag">
                    <Footprints size={12} />
                    {entry.recoveriesCount}
                  </span>
                </div>

                <div className="lb-time">
                  <Clock size={14} />
                  <strong>{formatTime(entry.durationMs)}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="canopy-modal-foot">
          <button className="canopy-btn secondary" onClick={loadLeaderboard}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="canopy-btn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
