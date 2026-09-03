import React from 'react';
import { Award, Footprints, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';
import { MobileJoystick } from './MobileJoystick';
import type { ControllerState } from '../engine/CanopyController';
import type { CheckpointData } from '../engine/CanopyRunScene';

interface CanopyHUDProps {
  elapsedTimeMs: number;
  checkpointIndex: number;
  checkpoints: CheckpointData[];
  recoveriesCount: number;
  controllerState: ControllerState | null;
  personalBestMs: number | null;
  mode: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onJumpPress: () => void;
  onSprintToggle: (active: boolean) => void;
  onJoystickMove: (x: number, y: number) => void;
}

export const CanopyHUD: React.FC<CanopyHUDProps> = ({
  elapsedTimeMs,
  checkpointIndex,
  checkpoints,
  recoveriesCount,
  controllerState,
  personalBestMs,
  mode,
  isMuted,
  onToggleMute,
  onJumpPress,
  onSprintToggle,
  onJoystickMove
}) => {
  const currentCp = checkpoints[checkpointIndex] || checkpoints[0];
  const totalCps = checkpoints.length - 1; // 0 to 4

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  const staminaPct = controllerState ? Math.round((controllerState.stamina / controllerState.maxStamina) * 100) : 100;

  return (
    <div className="canopy-hud-overlay">
      {/* Top Left: Timer & Checkpoint */}
      <div className="canopy-hud-card canopy-hud-top-left">
        <div className="canopy-hud-brand">
          <span className="canopy-hud-dot" />
          <span className="canopy-hud-tag">
            {mode === 'prize_race' ? 'PRIZE RACE' : mode === 'practice' ? 'PRACTICE' : 'FREE PLAY'}
          </span>
        </div>
        <div className="canopy-hud-timer">{formatTime(elapsedTimeMs)}</div>
        <div className="canopy-hud-checkpoint-label">
          <strong>Checkpoint {checkpointIndex} / {totalCps}</strong>
          <span>{currentCp.name}</span>
        </div>
      </div>

      {/* Top Right: PB & Settings */}
      <div className="canopy-hud-card canopy-hud-top-right">
        <div className="canopy-hud-pb">
          <Award size={15} />
          <div>
            <span>Best Today</span>
            <strong>{personalBestMs ? formatTime(personalBestMs) : '--:--.--'}</strong>
          </div>
        </div>
        <button
          className="canopy-hud-icon-btn"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>

      {/* Center Top Context Action Pill */}
      {controllerState?.activePrompt && (
        <div className="canopy-hud-prompt">
          <Sparkles size={16} />
          <span>{controllerState.activePrompt}</span>
        </div>
      )}

      {/* Bottom Center Progress & Stamina */}
      <div className="canopy-hud-bottom-center">
        {/* Route Progress Bar */}
        <div className="canopy-hud-route-bar">
          <div className="canopy-hud-route-fill" style={{ width: `${(checkpointIndex / totalCps) * 100}%` }} />
          <div className="canopy-hud-route-nodes">
            {checkpoints.map((cp, idx) => (
              <div
                key={cp.id}
                className={`canopy-hud-node ${idx <= checkpointIndex ? 'active' : ''}`}
                title={cp.name}
              />
            ))}
          </div>
        </div>

        {/* Stamina Burst Gauge */}
        <div className="canopy-hud-stamina-wrap">
          <Zap size={14} className={staminaPct < 20 ? 'stamina-low' : ''} />
          <div className="canopy-hud-stamina-bar">
            <div
              className={`canopy-hud-stamina-fill ${staminaPct < 25 ? 'low' : ''}`}
              style={{ width: `${staminaPct}%` }}
            />
          </div>
          <span className="canopy-hud-stamina-text">SPRINT [SHIFT]</span>
        </div>

        {/* Recovery Counter */}
        {recoveriesCount > 0 && (
          <div className="canopy-hud-recoveries">
            <Footprints size={14} />
            <span>{recoveriesCount} {recoveriesCount === 1 ? 'recovery' : 'recoveries'}</span>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="canopy-hud-mobile-controls">
        <MobileJoystick onMove={onJoystickMove} />
        <div className="canopy-hud-mobile-actions">
          <button
            className="canopy-hud-action-btn sprint"
            onPointerDown={() => onSprintToggle(true)}
            onPointerUp={() => onSprintToggle(false)}
            onPointerCancel={() => onSprintToggle(false)}
          >
            <Zap size={20} />
            <span>SPRINT</span>
          </button>
          <button
            className="canopy-hud-action-btn jump"
            onPointerDown={onJumpPress}
          >
            <span>JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
