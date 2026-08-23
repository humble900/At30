import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, Eye, Gift, HelpCircle, LogOut, MessageCircle, Send, Users, Volume2, VolumeX, Zap } from 'lucide-react';
import type { BrandKey, DiscoveredCoupon, ExhibitItem, PlayerPosition } from '../types';
import { soundEngine } from '../utils/audio';
import { MiniMap } from './MiniMap';
import { MobileJoystick } from './MobileJoystick';
import './MuseumUI.css';
import type { MultiplayerConnectionState } from '../multiplayer/types';
import type { MasterpieceArt } from '../data/artworks';
import type { MuseumInfoPoint } from '../engine/MuseumScene';

interface HUDProps {
  visitorName: string; avatarColor: string; discoveredCodes: Record<BrandKey, DiscoveredCoupon | null>;
  nearbyExhibit: ExhibitItem | null; nearbyArtwork: MasterpieceArt | null; nearbyInfoPoint: MuseumInfoPoint | null; isNearExit: boolean; playerPos: PlayerPosition; isAudioMuted: boolean;
  onToggleAudio: () => void; onOpenPassport: () => void; onOpenHelp: () => void; onOpenExit: () => void;
  onInspectExhibit: (exhibit: ExhibitItem) => void; onJoystickMove: (x: number, y: number) => void;
  onInspectArtwork: (artwork: MasterpieceArt) => void;
  onInspectInfoPoint: (point: MuseumInfoPoint) => void;
  onDirectionalInput: (forward: boolean, backward: boolean, left: boolean, right: boolean) => void;
  onJump?: () => void; onSprintToggle?: (isSprinting: boolean) => void;
  multiplayerState: MultiplayerConnectionState; onlineCount: number; onSendSpeech: (text: string) => boolean;
  speechTarget: { sessionId: string; displayName: string } | null; onClearSpeechTarget: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  visitorName, avatarColor, discoveredCodes, nearbyExhibit, nearbyArtwork, nearbyInfoPoint, isNearExit, playerPos, isAudioMuted,
  onToggleAudio, onOpenPassport, onOpenHelp, onOpenExit, onInspectExhibit, onInspectArtwork, onInspectInfoPoint, onJoystickMove, onJump, onSprintToggle,
  multiplayerState, onlineCount, onSendSpeech,
  speechTarget, onClearSpeechTarget,
}) => {
  const totalUnlocked = Object.values(discoveredCodes).filter(Boolean).length;
  const [isSprinting, setIsSprinting] = useState(false);
  const [isSpeechOpen, setIsSpeechOpen] = useState(false);
  const [speechText, setSpeechText] = useState('');
  useEffect(() => { if (speechTarget) setIsSpeechOpen(true); }, [speechTarget]);
  const toggleSprint = () => { const next = !isSprinting; setIsSprinting(next); onSprintToggle?.(next); soundEngine.playClick(); };
  const submitSpeech = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSendSpeech(speechText)) { setSpeechText(''); setIsSpeechOpen(false); }
  };

  return (
    <div className="museum-hud">
      <header className="museum-toolbar">
        <div className="museum-identity">
          <span className="museum-avatar" style={{ backgroundColor: avatarColor }}>{visitorName.charAt(0).toUpperCase()}</span>
          <div><strong>AT30 Museum</strong><small>{visitorName}</small></div>
        </div>
        <div className="museum-objective"><small>CURRENT OBJECTIVE</small><strong>{totalUnlocked === 3 ? 'Collection complete' : `Find ${3 - totalUnlocked} remaining reward${3 - totalUnlocked === 1 ? '' : 's'}`}</strong></div>
        <div className="museum-actions">
          <span className={`online-count ${multiplayerState}`} title={`Multiplayer: ${multiplayerState}`}><Users size={15} />{onlineCount}</span>
          <button className="passport-button" onClick={onOpenPassport}><Gift size={17} /><span>Passport</span><strong>{totalUnlocked}/3</strong></button>
          <button onClick={() => setIsSpeechOpen((open) => !open)} aria-label="Speak to nearby visitors" title="Speak to nearby visitors"><MessageCircle size={17} /></button>
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
        ) : nearbyArtwork ? (
          <div className="interaction-card artwork-card"><div><small>FROM THE COLLECTION</small><strong>{nearbyArtwork.title}</strong></div><button onClick={() => onInspectArtwork(nearbyArtwork)}><Eye size={17}/> Inspect <kbd>E</kbd></button></div>
        ) : nearbyInfoPoint ? (
          <div className={`interaction-card ${nearbyInfoPoint.kind==='partnership'?'partnership-card':'guide-card'}`}><div><small>{nearbyInfoPoint.kind==='partnership'?'PARTNERSHIPS':'VISITOR GUIDE'}</small><strong>{nearbyInfoPoint.title}</strong></div><button onClick={() => onInspectInfoPoint(nearbyInfoPoint)}><Eye size={17}/> Inspect <kbd>E</kbd></button></div>
        ) : isNearExit ? (
          <div className="interaction-card exit-card"><div><small>SOUTH ENTRANCE</small><strong>Return to landing page</strong></div><button onClick={onOpenExit}><LogOut size={17} /> Exit</button></div>
        ) : null}
      </div>

      {isSpeechOpen && (
        <form className="avatar-speech-form" onSubmit={submitSpeech}>
          <div className="speech-heading"><label htmlFor="avatar-speech">{speechTarget ? `To ${speechTarget.displayName}` : 'Speak to nearby visitors'}</label>{speechTarget && <button type="button" onClick={onClearSpeechTarget}>Nearby instead</button>}</div>
          <div className="speech-input-row"><input id="avatar-speech" autoFocus maxLength={100} value={speechText} onChange={(event) => setSpeechText(event.target.value)} placeholder={multiplayerState === 'online' ? 'Type a short message…' : 'Multiplayer is offline'} disabled={multiplayerState !== 'online'} /><button type="submit" disabled={!speechText.trim() || multiplayerState !== 'online'} aria-label="Send speech"><Send size={17} /></button></div>
          <small>{speechText.length}/100 · {speechTarget ? 'Private to this visitor' : 'Visible to visitors within 9 metres'} · Disappears after 6 seconds</small>
        </form>
      )}

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
