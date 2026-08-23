import React, { useState } from 'react';
import { ArrowUpCircle, Eye, Gift, HelpCircle, LogOut, Volume2, VolumeX, Zap } from 'lucide-react';
import type { BrandKey, DiscoveredCoupon, ExhibitItem, PlayerPosition } from '../types';
import { soundEngine } from '../utils/audio';
import { MiniMap } from './MiniMap';
import { MobileJoystick } from './MobileJoystick';
import './MuseumUI.css';

interface HUDProps {
  visitorName: string; avatarColor: string; discoveredCodes: Record<BrandKey, DiscoveredCoupon | null>;
  nearbyExhibit: ExhibitItem | null; isNearExit: boolean; playerPos: PlayerPosition; isAudioMuted: boolean;
  onToggleAudio: () => void; onOpenPassport: () => void; onOpenHelp: () => void; onOpenExit: () => void;
  onInspectExhibit: (exhibit: ExhibitItem) => void; onJoystickMove: (x: number, y: number) => void;
  onDirectionalInput: (forward: boolean, backward: boolean, left: boolean, right: boolean) => void;
  onJump?: () => void; onSprintToggle?: (isSprinting: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  visitorName, avatarColor, discoveredCodes, nearbyExhibit, isNearExit, playerPos, isAudioMuted,
  onToggleAudio, onOpenPassport, onOpenHelp, onOpenExit, onInspectExhibit, onJoystickMove, onJump, onSprintToggle,
}) => {
  const totalUnlocked = Object.values(discoveredCodes).filter(Boolean).length;
  const [isSprinting, setIsSprinting] = useState(false);
  const toggleSprint = () => { const next = !isSprinting; setIsSprinting(next); onSprintToggle?.(next); soundEngine.playClick(); };

  return (
    <div className="museum-hud">
      <header className="museum-toolbar">
        <div className="museum-identity">
          <span className="museum-avatar" style={{ backgroundColor: avatarColor }}>{visitorName.charAt(0).toUpperCase()}</span>
          <div><strong>AT30 Museum</strong><small>{visitorName}</small></div>
        </div>
        <div className="museum-objective"><small>CURRENT OBJECTIVE</small><strong>{totalUnlocked === 3 ? 'Collection complete' : `Find ${3 - totalUnlocked} remaining reward${3 - totalUnlocked === 1 ? '' : 's'}`}</strong></div>
        <div className="museum-actions">
          <button className="passport-button" onClick={onOpenPassport}><Gift size={17} /><span>Passport</span><strong>{totalUnlocked}/3</strong></button>
          <button onClick={onToggleAudio} aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'} title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}>{isAudioMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <button onClick={onOpenHelp} aria-label="Open controls and help" title="Controls and help"><HelpCircle size={17} /></button>
          <button onClick={onOpenExit} aria-label="Exit museum" title="Exit museum"><LogOut size={17} /></button>
        </div>
      </header>

      <div className="museum-context">
        {nearbyExhibit ? (
          <div className="interaction-card" style={{ borderColor: nearbyExhibit.themeColor }}>
            <div><small>{nearbyExhibit.wing}</small><strong>{nearbyExhibit.title}</strong></div>
            <button onClick={() => onInspectExhibit(nearbyExhibit)}><Eye size={17} /> Inspect <kbd>E</kbd></button>
          </div>
        ) : isNearExit ? (
          <div className="interaction-card exit-card"><div><small>SOUTH ENTRANCE</small><strong>Return to reception</strong></div><button onClick={onOpenExit}><LogOut size={17} /> Exit</button></div>
        ) : null}
      </div>

      <footer className="museum-bottom-bar">
        <div className="mobile-controls">
          <MobileJoystick onMove={onJoystickMove} />
          <div><button onClick={() => onJump?.()} aria-label="Jump"><ArrowUpCircle size={22} /></button><button className={isSprinting ? 'active' : ''} onClick={toggleSprint} aria-label="Toggle sprint"><Zap size={20} /></button></div>
        </div>
        <div className="desktop-hint"><span><kbd>WASD</kbd> Move</span><span><kbd>Drag</kbd> Look</span><span><kbd>E</kbd> Inspect</span></div>
        <MiniMap playerPos={playerPos} discoveredCodes={discoveredCodes} />
      </footer>
    </div>
  );
};
