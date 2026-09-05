import React from 'react';
import { BookOpen, Check, X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const CanopyRulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="canopy-modal-backdrop">
      <div className="canopy-rules-modal">
        <div className="canopy-modal-head">
          <div className="title-wrap">
            <BookOpen size={24} className="gold-trophy" />
            <div>
              <h2>Official Competition Rules</h2>
              <p>Touch Grass: Canopy Run — Season 1 (Sponsored by FiledCrews)</p>
            </div>
          </div>
          <button className="canopy-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="canopy-rules-content">
          <section className="rules-section">
            <h3>1. Prize Ladder & Allocation</h3>
            <p>Total Prize Pool: <strong>$2,000 in FiledCrews Credit</strong>.</p>
            <div className="rules-prize-grid">
              <div className="rules-prize-card">
                <span className="badge">1st Place</span>
                <strong>$1,000 Credit</strong>
                <small>First verified eligible finisher</small>
              </div>
              <div className="rules-prize-card">
                <span className="badge">2nd Place</span>
                <strong>$700 Credit</strong>
                <small>Second verified eligible finisher</small>
              </div>
              <div className="rules-prize-card">
                <span className="badge">3rd Place</span>
                <strong>$300 Credit</strong>
                <small>Third verified eligible finisher</small>
              </div>
            </div>
          </section>

          <section className="rules-section">
            <h3>2. Eligibility & Participation</h3>
            <ul>
              <li><Check size={16} /> Open to all individuals age 18 or older.</li>
              <li><Check size={16} /> Free to enter in Practice, Prize Race, or Free Play mode. No purchase necessary.</li>
              <li><Check size={16} /> Maximum of one prize per person and per verified FiledCrews account.</li>
              <li><Check size={16} /> A FiledCrews account is not required to race, but is required for offline claim approval.</li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>3. Provisional Claims & Offline Review Workflow</h3>
            <p>
              When a participant achieves a provisional prize position and submits their FiledCrews email, the prize tier enters <code>pending_review</code> status.
            </p>
            <p>
              FiledCrews verifies each submitted email account offline. An Any30 Administrator then officially approves or rejects the claim. In the event of a disqualification or unverified claim, the next earliest eligible runner on the waitlist is promoted.
            </p>
          </section>

          <section className="rules-section">
            <h3>4. Fair Play & Anti-Cheat Validation</h3>
            <p>
              All runs are verified against server-issued timestamps, sequential checkpoint intervals, and velocity thresholds. Automated scripts, clock tampering, and collision abuse will result in run invalidation.
            </p>
          </section>
        </div>

        <div className="canopy-modal-foot">
          <button className="canopy-btn primary" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
