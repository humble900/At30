import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Play,
  Trophy
} from 'lucide-react';
import { AVATAR_COLORWAYS, CanopyAvatar } from '../engine/CanopyAvatar';
import { CanopyController, type ControllerState } from '../engine/CanopyController';
import { CanopyRunScene, type FallType } from '../engine/CanopyRunScene';
import { CanopyHUD } from './CanopyHUD';
import { FinishCardModal } from './FinishCardModal';
import { CanopyLeaderboardModal } from './CanopyLeaderboardModal';
import { CanopyRulesModal } from './CanopyRulesModal';
import { canopyAudio } from '../utils/canopyAudio';
import {
  canopyCompetition,
  type FinalizeRunResult,
  type GameMode,
  type PrizeTierState
} from '../services/CanopyCompetitionService';
import './CanopyRun.css';

interface CanopyRunExperienceProps {
  visitorName: string;
  avatarColor: string;
  onExit: () => void;
}

type Phase = 'lobby' | 'countdown' | 'running' | 'finished';

export const CanopyRunExperience: React.FC<CanopyRunExperienceProps> = ({
  visitorName: initialName,
  avatarColor: initialColor,
  onExit
}) => {
  // Mount refs
  const mountRef = useRef<HTMLDivElement>(null);
  const previewMountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<CanopyController | null>(null);
  const avatarRef = useRef<CanopyAvatar | null>(null);
  const sceneRef = useRef<CanopyRunScene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  // Avatar Customization State
  const [visitorName, setVisitorName] = useState(initialName || 'Explorer');
  const [avatarColor, setAvatarColor] = useState(initialColor || '#84CC16');
  const [hasGlasses, setHasGlasses] = useState(true);

  // Game Lifecycle State
  const [phase, setPhase] = useState<Phase>('lobby');
  const [selectedMode, setSelectedMode] = useState<GameMode>('prize_race');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [startTimeMs, setStartTimeMs] = useState<number>(0);
  const [checkpointIndex, setCheckpointIndex] = useState<number>(0);
  const [recoveriesCount, setRecoveriesCount] = useState<number>(0);
  const [controllerState, setControllerState] = useState<ControllerState | null>(null);
  const [personalBestMs, setPersonalBestMs] = useState<number | null>(() => {
    const saved = localStorage.getItem('at30_canopy_pb_prize_race') || localStorage.getItem('at30_canopy_pb_free_play');
    return saved ? parseInt(saved, 10) : null;
  });

  // Prize & Competition Data
  const [prizeTiers, setPrizeTiers] = useState<PrizeTierState[]>([]);
  const [runResult, setRunResult] = useState<FinalizeRunResult | null>(null);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [notice, setNotice] = useState('');

  // Fetch active season data on load
  useEffect(() => {
    canopyCompetition.getActiveSeasonAndPrizes().then((res) => {
      setPrizeTiers(res.prizeTiers);
    });
  }, []);

  // -------------------------------------------------------------
  // PREVIEW AVATAR IN LOBBY (Small Three.js scene)
  // -------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'lobby' || !previewMountRef.current) return;

    const el = previewMountRef.current;
    const width = el.clientWidth || 300;
    const height = el.clientHeight || 360;

    const previewScene = new THREE.Scene();
    const previewCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    previewCamera.position.set(0, 1.3, 3.4);
    previewCamera.lookAt(0, 1.05, 0);

    const previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    previewRenderer.setSize(width, height);
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.innerHTML = '';
    el.appendChild(previewRenderer.domElement);

    const hemi = new THREE.HemisphereLight('#FFF3D6', '#264228', 2.4);
    previewScene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.2);
    keyLight.position.set(2, 4, 3);
    previewScene.add(keyLight);

    const previewAvatar = new CanopyAvatar({
      jacketColor: avatarColor,
      hasGlasses,
      name: visitorName
    });
    previewScene.add(previewAvatar.group);

    let rafId = 0;
    let lastTime = performance.now();

    const animatePreview = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      previewAvatar.group.rotation.y += delta * 0.45;
      previewAvatar.update(delta, false);
      previewRenderer.render(previewScene, previewCamera);
      rafId = requestAnimationFrame(animatePreview);
    };

    rafId = requestAnimationFrame(animatePreview);

    return () => {
      cancelAnimationFrame(rafId);
      previewAvatar.dispose();
      previewRenderer.dispose();
      el.innerHTML = '';
    };
  }, [phase, avatarColor, hasGlasses, visitorName]);

  // -------------------------------------------------------------
  // FULL GAME ENGINE SETUP (Running / Finished)
  // -------------------------------------------------------------
  useEffect(() => {
    if (phase === 'lobby' || !mountRef.current) return;

    const el = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(58, el.clientWidth / el.clientHeight, 0.1, 450);
    const world = new CanopyRunScene();
    sceneRef.current = world;
    world.initEnvironmentMap(renderer);

    const avatar = new CanopyAvatar({
      jacketColor: avatarColor,
      hasGlasses,
      name: visitorName
    });
    avatar.riggedAvatar.hideNameTag(); // Local player should not see their own name card
    avatarRef.current = avatar;
    world.scene.add(avatar.group);

    const controller = new CanopyController(
      avatar,
      camera,
      world,
      (fallType: FallType) => {
        setRecoveriesCount((v) => v + 1);
        setNotice(fallType === 'water' ? 'The river swept you back to safety.' : 'Ledge drop! Recovered at last checkpoint.');
        setTimeout(() => setNotice(''), 2200);
      },
      (cpIndex: number) => {
        setCheckpointIndex(cpIndex);
        canopyCompetition.recordCheckpoint(cpIndex, controller.position.x, controller.position.z);
      },
      () => {
        handleFinishCourse();
      }
    );
    controllerRef.current = controller;

    canopyAudio.startAmbiance();

    let lastTime = performance.now();

    const resize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      rendererRef.current.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const loop = (now: number) => {
      const delta = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      if (phase === 'running' && controllerRef.current) {
        controllerRef.current.update(delta);
        setControllerState(controllerRef.current.getState());
        setElapsedTimeMs(Date.now() - startTimeMs);
      }

      renderer.render(world.scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      controller.dispose();
      avatar.dispose();
      world.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [phase, avatarColor, hasGlasses, visitorName, startTimeMs]);

  // -------------------------------------------------------------
  // START RUN & COUNTDOWN FLOW
  // -------------------------------------------------------------
  const handleStartRun = async () => {
    await canopyCompetition.startRun(selectedMode, visitorName, avatarColor, hasGlasses);

    setPhase('countdown');
    setCountdownNum(3);
    canopyAudio.playCountdown(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdownNum(count);
      if (count > 0) {
        canopyAudio.playCountdown(false);
      } else if (count === 0) {
        canopyAudio.playCountdown(true);
      } else {
        clearInterval(interval);
        const now = Date.now();
        setStartTimeMs(now);
        setElapsedTimeMs(0);
        setCheckpointIndex(0);
        setRecoveriesCount(0);
        controllerRef.current?.resetToStart();
        setPhase('running');
      }
    }, 900);
  };

  // -------------------------------------------------------------
  // FINISH RUN FLOW
  // -------------------------------------------------------------
  const handleFinishCourse = async () => {
    setPhase('finished');
    const result = await canopyCompetition.finalizeRun(
      recoveriesCount,
      visitorName,
      avatarColor,
      hasGlasses
    );
    setRunResult(result);
    if (result.isPersonalBest) {
      setPersonalBestMs(result.durationMs);
    }
  };

  const handleRetry = () => {
    setRunResult(null);
    handleStartRun();
  };

  return (
    <main className="canopy-experience-shell">
      {/* 3D Game World Mount */}
      {phase !== 'lobby' && <div className="canopy-3d-stage" ref={mountRef} />}

      {/* ------------------------------------------------------------- */}
      {/* LOBBY / PRE-GAME EXPERIENCE SCREEN */}
      {/* ------------------------------------------------------------- */}
      {phase === 'lobby' && (
        <div className="canopy-lobby-view">
          <div className="canopy-lobby-container">
            {/* Header Navigation */}
            <div className="canopy-lobby-top">
              <button className="canopy-back-btn" onClick={onExit}>
                <ArrowLeft size={18} />
                <span>Return to Any30</span>
              </button>
              <div className="canopy-badge">
                <span className="live-pulse" />
                <span>EXPERIENCE 002 · PRIZE SEASON LIVE</span>
              </div>
            </div>

            {/* Main Lobby Grid */}
            <div className="canopy-lobby-grid">
              {/* Left Column: Game Briefing & Mode Selection */}
              <div className="canopy-lobby-left">
                <div className="canopy-hero-text">
                  <span className="canopy-kicker">TOUCH GRASS: CANOPY RUN</span>
                  <h1>Run the forest. Take the shortcut. Beat the clock.</h1>
                  <p className="canopy-lead">
                    An outdoor 3D forest obstacle course across 5 natural checkpoints. Jump rushing creeks, balance on fallen timber, climb granite bluffs, and ring the finish bell.
                  </p>
                </div>

                {/* Prize Ladder Overview */}
                <div className="canopy-prize-ladder-card">
                  <div className="card-header">
                    <Trophy size={20} className="gold-trophy" />
                    <strong>FiledCrews Prize Season Ladder</strong>
                    <span className="total-pool">$2,000 Total Value</span>
                  </div>
                  <div className="prize-tiers-row">
                    {prizeTiers.map((tier) => (
                      <div key={tier.position} className="prize-tier-badge">
                        <span className="tier-pos">#{tier.position}</span>
                        <strong className="tier-amount">${tier.amountUsd.toLocaleString()}</strong>
                        <span className="tier-desc">FiledCrews Credit</span>
                        <span className={`tier-state ${tier.state}`}>
                          {tier.state === 'available' ? 'Available' : 'Pending Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Mode Selector */}
                <div className="canopy-mode-select">
                  <span className="section-label">Select Game Mode</span>
                  <div className="mode-cards-grid">
                    <button
                      className={`mode-card ${selectedMode === 'prize_race' ? 'selected' : ''}`}
                      onClick={() => setSelectedMode('prize_race')}
                    >
                      <div className="mode-card-top">
                        <Trophy size={18} />
                        <span className="mode-pill live">PRIZE ELIGIBLE</span>
                      </div>
                      <strong>Prize Race</strong>
                      <p>Compete for the provisional $1,000 / $700 / $300 FiledCrews credit prize ladder.</p>
                    </button>

                    <button
                      className={`mode-card ${selectedMode === 'free_play' ? 'selected' : ''}`}
                      onClick={() => setSelectedMode('free_play')}
                    >
                      <div className="mode-card-top">
                        <Flame size={18} />
                        <span className="mode-pill">LEADERBOARD</span>
                      </div>
                      <strong>Free Play</strong>
                      <p>Race for your personal best and compete on the global public leaderboard.</p>
                    </button>

                    <button
                      className={`mode-card ${selectedMode === 'practice' ? 'selected' : ''}`}
                      onClick={() => setSelectedMode('practice')}
                    >
                      <div className="mode-card-top">
                        <Compass size={18} />
                        <span className="mode-pill">TUTORIAL</span>
                      </div>
                      <strong>Practice</strong>
                      <p>Explore the 5 checkpoints, test jumps and shortcuts with no pressure.</p>
                    </button>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="canopy-launch-box">
                  <button className="canopy-launch-btn" onClick={handleStartRun}>
                    <Play size={22} />
                    <span>Enter Course in {selectedMode === 'prize_race' ? 'Prize Race' : selectedMode === 'practice' ? 'Practice' : 'Free Play'}</span>
                  </button>

                  <div className="canopy-quick-links">
                    <button onClick={() => setIsRulesOpen(true)}>
                      <BookOpen size={15} />
                      <span>Official Rules</span>
                    </button>
                    <button onClick={() => setIsLeaderboardOpen(true)}>
                      <Trophy size={15} />
                      <span>Leaderboard</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Avatar Customizer */}
              <div className="canopy-lobby-right">
                <div className="canopy-avatar-preview-card">
                  <span className="card-kicker">EXPLORER GEAR & SILHOUETTE</span>
                  <div className="preview-3d-stage" ref={previewMountRef} />

                  {/* Name Input */}
                  <div className="customizer-section">
                    <label>Explorer Name</label>
                    <input
                      type="text"
                      className="canopy-name-input"
                      value={visitorName}
                      maxLength={20}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Enter runner name"
                    />
                  </div>

                  {/* Colorway Palette */}
                  <div className="customizer-section">
                    <label>Jacket Colorway</label>
                    <div className="color-swatches-row">
                      {AVATAR_COLORWAYS.map((c) => (
                        <button
                          key={c.key}
                          className={`color-swatch ${avatarColor === c.hex ? 'active' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => setAvatarColor(c.hex)}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Glasses Toggle */}
                  <div className="customizer-section glasses-toggle-row">
                    <span>Glasses Accessory</span>
                    <button
                      className={`canopy-pill-btn ${hasGlasses ? 'active' : ''}`}
                      onClick={() => setHasGlasses(!hasGlasses)}
                    >
                      {hasGlasses ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{hasGlasses ? 'Equipped' : 'None'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* COUNTDOWN OVERLAY */}
      {/* ------------------------------------------------------------- */}
      {phase === 'countdown' && (
        <div className="canopy-countdown-overlay">
          <div className="canopy-countdown-number">
            {countdownNum === 0 ? 'GO!' : countdownNum}
          </div>
          <span className="canopy-countdown-sub">Get Ready to Run</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* IN-GAME HUD */}
      {/* ------------------------------------------------------------- */}
      {phase === 'running' && sceneRef.current && (
        <CanopyHUD
          elapsedTimeMs={elapsedTimeMs}
          checkpointIndex={checkpointIndex}
          checkpoints={sceneRef.current.checkpoints}
          recoveriesCount={recoveriesCount}
          controllerState={controllerState}
          personalBestMs={personalBestMs}
          mode={selectedMode}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            canopyAudio.setMuted(next);
          }}
          onJumpPress={() => controllerRef.current?.triggerTouchJump()}
          onSprintToggle={(active) => controllerRef.current?.setTouchSprint(active)}
          onJoystickMove={(x, y) => controllerRef.current?.setTouchStick(x, y)}
        />
      )}

      {/* Fall / Recovery Notice Banner */}
      {notice && <div className="canopy-screen-notice">{notice}</div>}

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}
      {phase === 'finished' && runResult && (
        <FinishCardModal
          result={runResult}
          visitorName={visitorName}
          onRetry={handleRetry}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onExit={onExit}
        />
      )}

      {isLeaderboardOpen && (
        <CanopyLeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />
      )}

      {isRulesOpen && (
        <CanopyRulesModal onClose={() => setIsRulesOpen(false)} />
      )}
    </main>
  );
};
