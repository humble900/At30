import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, Eye, Gamepad2, Gift, HelpCircle, LogOut, Maximize, MessageCircle, Minimize, Send, Users, Volume2, VolumeX, Zap } from 'lucide-react';
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
  totalPlayedCount?: number;
}

export const HUD: React.FC<HUDProps> = ({
  visitorName, avatarColor, discoveredCodes, nearbyExhibit, nearbyArtwork, nearbyInfoPoint, isNearExit, playerPos, isAudioMuted,
  onToggleAudio, onOpenPassport, onOpenHelp, onOpenExit, onInspectExhibit, onInspectArtwork, onInspectInfoPoint, onJoystickMove, onJump, onSprintToggle,
  multiplayerState, onlineCount, onSendSpeech,
  speechTarget, onClearSpeechTarget,
  totalPlayedCount,
}) => {
  const totalUnlocked = Object.values(discoveredCodes).filter(Boolean).length;
  const [isSprinting, setIsSprinting] = useState(false);
  const [isSpeechOpen, setIsSpeechOpen] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const supportsFullscreen = typeof document.documentElement.requestFullscreen === 'function';
  useEffect(() => { if (speechTarget) setIsSpeechOpen(true); }, [speechTarget]);
  useEffect(() => { const sync=()=>setIsFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange',sync); return()=>document.removeEventListener('fullscreenchange',sync); }, []);
  const toggleSprint = () => { const next = !isSprinting; setIsSprinting(next); onSprintToggle?.(next); soundEngine.playClick(); };
  const submitSpeech = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSendSpeech(speechText)) { setSpeechText(''); setIsSpeechOpen(false); }
  };
  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch { /* Browser keeps the edge-to-edge viewport fallback. */ }
  };

  return (
    <div className="museum-hud">
      <header className="museum-toolbar">
        <div className="museum-identity">
          <span className="museum-avatar" style={{ backgroundColor: avatarColor }}>{visitorName.charAt(0).toUpperCase()}</span>
          <div><strong>Any30 Museum</strong><small>{visitorName}</small></div>
        </div>
        <div className="museum-objective"><small>CURRENT OBJECTIVE</small><strong>{totalUnlocked === 3 ? 'Collection complete' : `Find ${3 - totalUnlocked} remaining reward${3 - totalUnlocked === 1 ? '' : 's'}`}</strong></div>
        <div className="museum-actions">
          <span className="played-count-badge" title="Total visitors who have played the Any30 Digital Museum">
            <Gamepad2 size={15} />
            <span><strong>{(totalPlayedCount ?? 10).toLocaleString()}</strong> played</span>
          </span>

          <span className={`online-count ${multiplayerState}`} title={`Multiplayer: ${multiplayerState}`}><Users size={15} />{onlineCount}</span>

          <button className="passport-button" onClick={onOpenPassport}><Gift size={17} /><span>Passport</span><strong>{totalUnlocked}/3</strong></button>
          <button className="speech-button" onClick={() => setIsSpeechOpen((open) => !open)} aria-label="Speak to nearby visitors" title="Speak to nearby visitors"><MessageCircle size={17} /></button>
          <button className="audio-button" onClick={onToggleAudio} aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'} title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}>{isAudioMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          {supportsFullscreen && <button className="fullscreen-button" onClick={()=>void toggleFullscreen()} aria-label={isFullscreen?'Exit fullscreen':'Enter fullscreen'} title={isFullscreen?'Exit fullscreen':'Enter fullscreen'}>{isFullscreen?<Minimize size={17}/>:<Maximize size={17}/>}</button>}
          <button className="help-button" onClick={onOpenHelp} aria-label="Open controls and help" title="Controls and help"><HelpCircle size={17} /></button>
          <button className="exit-button" onClick={onOpenExit} aria-label="Exit museum" title="Exit museum"><LogOut size={17} /></button>
        </div>
      </header>

      <div className="museum-context">
        {nearbyExhibit ? (
          <div className="interaction-card interaction-pill" style={{ borderColor: nearbyExhibit.themeColor }}>
            <button onClick={() => onInspectExhibit(nearbyExhibit)} aria-label="Inspect exhibit">
              <Eye size={17} /> Inspect <kbd>E</kbd>
            </button>
          </div>
        ) : nearbyArtwork ? (
          <div className="interaction-card interaction-pill artwork-card">
            <button onClick={() => onInspectArtwork(nearbyArtwork)} aria-label="Inspect artwork">
              <Eye size={17} /> Inspect <kbd>E</kbd>
            </button>
          </div>
        ) : nearbyInfoPoint ? (
          nearbyInfoPoint.kind === 'guide' ? (
            <div className="interaction-card interaction-pill guide-pill">
              <button onClick={() => onInspectInfoPoint(nearbyInfoPoint)} aria-label="Open visitor guide">
                <Eye size={17} /> Inspect <kbd>E</kbd>
              </button>
            </div>
          ) : (
            <div className="interaction-card interaction-pill partnership-card" style={nearbyInfoPoint.kind === 'artifact' ? { borderColor: '#00F0FF' } : undefined}>
              <button onClick={() => onInspectInfoPoint(nearbyInfoPoint)} aria-label="Inspect info point">
                <Eye size={17} /> Inspect <kbd>E</kbd>
              </button>
            </div>
          )
        ) : isNearExit ? (
          <div className="interaction-card interaction-pill exit-card">
            <button onClick={onOpenExit} aria-label="Exit museum">
              <LogOut size={17} /> Exit <kbd>E</kbd>
            </button>
          </div>
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
