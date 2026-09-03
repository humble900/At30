import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { telemetry } from './services/TelemetryService';
import { MuseumScene, type MuseumInfoPoint } from './engine/MuseumScene';
import { Avatar } from './engine/Avatar';
import { PlayerController } from './engine/PlayerController';
import { EXHIBITS } from './data/exhibits';
import type { BrandKey, DiscoveredCoupon, ExhibitItem, PlayerPosition } from './types';
import { HUD } from './components/HUD';
import { ExhibitModal } from './components/ExhibitModal';
import { PassportModal } from './components/PassportModal';
import { ControlsOverlay } from './components/ControlsOverlay';
import { VictoryModal } from './components/VictoryModal';
import { ExitModal } from './components/ExitModal';
import { NameSelectModal } from './components/NameSelectModal';
import { ArtworkModal } from './components/ArtworkModal';
import { MuseumInfoModal } from './components/MuseumInfoModal';
import type { MasterpieceArt } from './data/artworks';
import { LandingPage } from './components/LandingPage';
import { soundEngine } from './utils/audio';
import { MultiplayerManager } from './multiplayer/MultiplayerManager';
import { RemotePlayerRegistry } from './multiplayer/RemotePlayerRegistry';
import type { MultiplayerConnectionState } from './multiplayer/types';
import { LegalPage } from './components/LegalPage';
import { CanopyRunExperience } from './components/CanopyRunExperience';
import { visitorStats, type PlatformPublicStats } from './services/VisitorStatsService';

interface MuseumExperienceProps {
  visitorName: string;
  avatarColor: string;
  onExitToReception: () => void;
}

const MuseumExperience: React.FC<MuseumExperienceProps> = ({
  visitorName,
  avatarColor,
  onExitToReception
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PlayerController | null>(null);
  const sceneInstanceRef = useRef<MuseumScene | null>(null);
  const localAvatarRef = useRef<Avatar | null>(null);
  const multiplayerRef = useRef<MultiplayerManager | null>(null);
  const remotePlayersRef = useRef<RemotePlayerRegistry | null>(null);

  // Game & Quest State
  const [stats, setStats] = useState<PlatformPublicStats>(() => visitorStats.getStats());
  useEffect(() => {
    void visitorStats.fetchStats().then(setStats);
    const unsubscribe = visitorStats.subscribe(setStats);
    return unsubscribe;
  }, []);

  const [discoveredCodes, setDiscoveredCodes] = useState<Record<BrandKey, DiscoveredCoupon | null>>(() => {
    try {
      const saved = localStorage.getItem('at30_discovered_coupons');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      posterbooking: null,
      clayrent: null,
      leadmagic: null
    };
  });

  const [nearbyExhibit, setNearbyExhibit] = useState<ExhibitItem | null>(null);
  const nearbyExhibitRef = useRef<ExhibitItem | null>(null);
  nearbyExhibitRef.current = nearbyExhibit;

  const [nearbyArtwork, setNearbyArtwork] = useState<MasterpieceArt | null>(null);
  const nearbyArtworkRef = useRef<MasterpieceArt | null>(null);
  nearbyArtworkRef.current = nearbyArtwork;

  const [nearbyInfoPoint, setNearbyInfoPoint] = useState<MuseumInfoPoint | null>(null);
  const nearbyInfoPointRef = useRef<MuseumInfoPoint | null>(null);
  nearbyInfoPointRef.current = nearbyInfoPoint;

  const [isNearExit, setIsNearExit] = useState<boolean>(false);
  const isNearExitRef = useRef<boolean>(false);
  isNearExitRef.current = isNearExit;

  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitItem | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<MasterpieceArt | null>(null);
  const [selectedInfoPoint, setSelectedInfoPoint] = useState<MuseumInfoPoint | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isExitOpen, setIsExitOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [hasTriggeredVictory, setHasTriggeredVictory] = useState<boolean>(() => localStorage.getItem('at30_victory_seen') === 'true');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerConnectionState>('offline');
  const [onlineCount, setOnlineCount] = useState(1);
  const [speechTarget, setSpeechTarget] = useState<{ sessionId: string; displayName: string } | null>(null);
  const isOverlayOpenRef = useRef(false);

  useEffect(() => {
    isOverlayOpenRef.current = Boolean(selectedExhibit || selectedArtwork || selectedInfoPoint || isPassportOpen || isHelpOpen || isExitOpen || isVictoryOpen);
  }, [selectedExhibit, selectedArtwork, selectedInfoPoint, isPassportOpen, isHelpOpen, isExitOpen, isVictoryOpen]);
  
  const [playerPos, setPlayerPos] = useState<PlayerPosition>({
    x: 0,
    y: 0,
    z: 8.5,
    rotationY: Math.PI
  });

  // Save to LocalStorage whenever codes change
  useEffect(() => {
    try {
      localStorage.setItem('at30_discovered_coupons', JSON.stringify(discoveredCodes));
    } catch {
      // Ignore
    }

    const total = Object.values(discoveredCodes).filter(Boolean).length;
    if (total === 3 && !hasTriggeredVictory) {
      setHasTriggeredVictory(true);
      setIsVictoryOpen(true);
      localStorage.setItem('at30_victory_seen', 'true');
    }
  }, [discoveredCodes, hasTriggeredVictory]);

  // Three.js Engine Mount & Lifecycle - RUNS ONCE ON MOUNT
  useEffect(() => {
    if (!mountRef.current) return;

    const viewportElement = mountRef.current.parentElement;
    const syncVisualViewport = () => {
      if (!viewportElement) return;
      const viewport = window.visualViewport;
      viewportElement.style.setProperty('--game-width', `${Math.round(viewport?.width || window.innerWidth)}px`);
      viewportElement.style.setProperty('--game-height', `${Math.round(viewport?.height || window.innerHeight)}px`);
      viewportElement.style.setProperty('--game-left', `${Math.round(viewport?.offsetLeft || 0)}px`);
      viewportElement.style.setProperty('--game-top', `${Math.round(viewport?.offsetTop || 0)}px`);
    };
    syncVisualViewport();

    const getViewportSize = () => {
      const rect = mountRef.current?.getBoundingClientRect();
      return {
        width: Math.max(1, Math.round(rect?.width || window.visualViewport?.width || window.innerWidth)),
        height: Math.max(1, Math.round(rect?.height || window.visualViewport?.height || window.innerHeight))
      };
    };
    const initialViewport = getViewportSize();
    const width = initialViewport.width;
    const height = initialViewport.height;

    // 1. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Clear previous canvas if any
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 150);
    camera.position.set(0, 2.8, 13.5);

    // 3. Scene & World
    const museumScene = new MuseumScene();
    sceneInstanceRef.current = museumScene;

    // 4. Avatar (with customized name and suit color)
    const avatar = new Avatar(avatarColor, visitorName);
    avatar.hideNameTag(); // Local player should not see their own name card
    localAvatarRef.current = avatar;
    museumScene.scene.add(avatar.group);

    const remotePlayers = new RemotePlayerRegistry(museumScene.scene);
    remotePlayersRef.current = remotePlayers;
    const multiplayer = new MultiplayerManager({
      onStateChange: setMultiplayerState,
      onPresenceSync: (players) => {
        remotePlayers.sync(players);
        setOnlineCount(players.length + 1);
        setSpeechTarget(current => current && players.some(player => player.sessionId === current.sessionId) ? current : null);
      },
      onTransform: (message) => remotePlayers.applyTransform(message),
      onSpeech: (message) => {
        const localPosition = controllerRef.current?.position;
        if (message.targetSessionId || (localPosition && localPosition.distanceTo(new THREE.Vector3(message.position.x, message.position.y, message.position.z)) <= 9)) {
          remotePlayers.showSpeech(message);
        }
      },
    });
    multiplayerRef.current = multiplayer;
    void multiplayer.connect(visitorName, avatarColor);

    // 5. Controller
    const controller = new PlayerController(
      avatar,
      camera,
      renderer.domElement,
      museumScene.collisionBoxes
    );
    controller.setViewportAspect(width / height);
    controllerRef.current = controller;

    let pointerStart = { x: 0, y: 0 };
    const handleAvatarPointerDown = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; };
    const handleAvatarPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const target = remotePlayers.pickPlayer(camera, ((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1, controller.position);
      if (target) { soundEngine.playClick(); setSpeechTarget(target); }
    };
    renderer.domElement.addEventListener('pointerdown', handleAvatarPointerDown);
    renderer.domElement.addEventListener('pointerup', handleAvatarPointerUp);

    // Proximity checking throttle timer
    let lastProximityCheck = 0;
    const clock = new THREE.Clock();
    const previousNetworkPosition = controller.position.clone();
    let previousNetworkRotation = controller.rotationY;
    let lastNetworkHeartbeat = 0;

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();
      telemetry.recordFps(delta > 0 ? 1 / delta : 60);
      telemetry.trackSpatialSample(controller.position.x, controller.position.z);

      // Update Controller & Camera
      controller.update(delta);
      remotePlayers.update(delta);
      avatar.updateSpeech();

      const movedDistance = controller.position.distanceTo(previousNetworkPosition);
      const rotationChanged = Math.abs(controller.rotationY - previousNetworkRotation) > 0.025;
      const now = performance.now();
      if (movedDistance > 0.015 || rotationChanged || now - lastNetworkHeartbeat > 1000) {
        const speed = delta > 0 ? movedDistance / delta : 0;
        multiplayer.sendTransform({
          position: { x: controller.position.x, y: controller.position.y, z: controller.position.z },
          rotationY: controller.rotationY,
          animation: controller.position.y > 0.08 ? 'jump' : movedDistance > 0.015 ? (speed > 7 ? 'run' : 'walk') : 'idle',
        });
        previousNetworkPosition.copy(controller.position);
        previousNetworkRotation = controller.rotationY;
        lastNetworkHeartbeat = now;
      }

      // Update Scene Animations
      museumScene.update(elapsedTime);

      // Update player position for mini-map (throttled)
      if (elapsedTime - lastProximityCheck > 0.08) {
        lastProximityCheck = elapsedTime;
        setPlayerPos({
          x: controller.position.x,
          y: controller.position.y,
          z: controller.position.z,
          rotationY: controller.rotationY
        });

        // Check proximity to South Entrance Exit Portal (z > 14.5)
        const nearExitPortal = controller.position.z >= 14.2 && Math.abs(controller.position.x) <= 3.0;
        setIsNearExit(nearExitPortal);

        // Close-range discovery keeps prompts out of the player's sightline until intentional approach.
        let closest: ExhibitItem | null = null;
        let minDistance = 2.35;

        for (const ex of EXHIBITS) {
          const dx = controller.position.x - ex.position[0];
          const dz = controller.position.z - ex.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < minDistance) {
            minDistance = dist;
            closest = ex;
          }
        }
        setNearbyExhibit(closest);

        let closestArtwork: MasterpieceArt | null = null;
        let artworkDistance = 1.8;
        for (const artwork of museumScene.artworks) {
          const dx = controller.position.x - artwork.position[0];
          const dz = controller.position.z - artwork.position[1];
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance < artworkDistance) {
            artworkDistance = distance;
            closestArtwork = artwork.item;
          }
        }
        setNearbyArtwork(closestArtwork);

        let closestInfoPoint: MuseumInfoPoint | null = null;
        let infoDistance = 2.0;
        for (const point of museumScene.infoPoints) {
          const dx = controller.position.x - point.position[0];
          const dz = controller.position.z - point.position[1];
          const distance = Math.sqrt(dx * dx + dz * dz);
          // The small guide book should be discovered visually before its prompt appears.
          // Other information points keep the more forgiving general interaction radius.
          const interactionRadius = point.kind === 'guide' ? 0.85 : 2.0;
          if (distance < interactionRadius && distance < infoDistance) {
            infoDistance = distance;
            closestInfoPoint = point;
          }
        }
        setNearbyInfoPoint(closestInfoPoint);
      }

      renderer.render(museumScene.scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      syncVisualViewport();
      const { width: w, height: h } = getViewportSize();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      controller.setViewportAspect(w / h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    const viewportObserver = new ResizeObserver(handleResize);
    viewportObserver.observe(mountRef.current);

    // Keydown for [E] inspect or exit
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOverlayOpenRef.current) return;
      if (e.code === 'KeyE') {
        if (isNearExitRef.current) {
          soundEngine.playClick();
          setIsExitOpen(true);
        } else if (nearbyExhibitRef.current) {
          soundEngine.playInspect();
          setSelectedExhibit(nearbyExhibitRef.current);
        } else if (nearbyArtworkRef.current) {
          soundEngine.playInspect();
          setSelectedArtwork(nearbyArtworkRef.current);
        } else if (nearbyInfoPointRef.current) {
          soundEngine.playInspect();
          setSelectedInfoPoint(nearbyInfoPointRef.current);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
      viewportObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('pointerdown', handleAvatarPointerDown);
      renderer.domElement.removeEventListener('pointerup', handleAvatarPointerUp);
      controller.dispose();
      void multiplayer.disconnect();
      remotePlayers.dispose();
      avatar.dispose();
      multiplayerRef.current = null;
      remotePlayersRef.current = null;
      localAvatarRef.current = null;
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [visitorName, avatarColor]);

  // Audio Toggle
  const handleToggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Claim Coupon
  const handleClaimCoupon = (coupon: DiscoveredCoupon) => {
    setDiscoveredCodes(prev => ({
      ...prev,
      [coupon.brandKey]: coupon
    }));
  };

  const handleSendSpeech = (text: string) => {
    const position = controllerRef.current?.position;
    if (!position) return false;
    const sent = multiplayerRef.current?.sendSpeech(text, { x: position.x, y: position.y, z: position.z }, speechTarget?.sessionId) ?? false;
    if (sent) localAvatarRef.current?.showSpeech(text, 6000);
    return sent;
  };

  return (
    <div className="game-viewport bg-black font-sans select-none">
      
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="game-canvas-host cursor-grab active:cursor-grabbing" />

      {/* Modern Glassmorphic HUD */}
      <HUD
        visitorName={visitorName}
        avatarColor={avatarColor}
        discoveredCodes={discoveredCodes}
        nearbyExhibit={nearbyExhibit}
        nearbyArtwork={nearbyArtwork}
        nearbyInfoPoint={nearbyInfoPoint}
        isNearExit={isNearExit}
        playerPos={playerPos}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenExit={() => setIsExitOpen(true)}
        onInspectExhibit={(ex) => setSelectedExhibit(ex)}
        onInspectArtwork={setSelectedArtwork}
        onInspectInfoPoint={setSelectedInfoPoint}
        onJoystickMove={(x, y) => {
          controllerRef.current?.setTouchJoystick(x, y);
        }}
        onDirectionalInput={(f, b, l, r) => {
          controllerRef.current?.setDirectionalInput(f, b, l, r);
        }}
        onJump={() => {
          controllerRef.current?.jump();
        }}
        onSprintToggle={(run) => {
          controllerRef.current?.setSprint(run);
        }}
        multiplayerState={multiplayerState}
        onlineCount={onlineCount}
        onSendSpeech={handleSendSpeech}
        speechTarget={speechTarget}
        onClearSpeechTarget={() => setSpeechTarget(null)}
        totalPlayedCount={stats.museumPlays}
      />


      {/* Exhibit Inspection & Clue Modal */}
      {selectedExhibit && (
        <ExhibitModal
          exhibit={selectedExhibit}
          isAlreadyClaimed={!!discoveredCodes[selectedExhibit.brandKey]}
          onClose={() => setSelectedExhibit(null)}
          onClaimCoupon={handleClaimCoupon}
        />
      )}

      {selectedArtwork && <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />}
      {selectedInfoPoint && <MuseumInfoModal point={selectedInfoPoint} onClose={() => setSelectedInfoPoint(null)} />}

      {/* Passport / Rewards Bag Modal */}
      {isPassportOpen && (
        <PassportModal
          visitorName={visitorName}
          discoveredCodes={discoveredCodes}
          onClose={() => setIsPassportOpen(false)}
        />
      )}

      {/* Exit Confirmation Modal */}
      {isExitOpen && (
        <ExitModal
          visitorName={visitorName}
          discoveredCodes={discoveredCodes}
          onConfirmExit={onExitToReception}
          onCancel={() => setIsExitOpen(false)}
        />
      )}

      {/* Controls & Scavenger Guide */}
      {isHelpOpen && (
        <ControlsOverlay onClose={() => setIsHelpOpen(false)} />
      )}

      {/* Grand Victory Celebration */}
      {isVictoryOpen && (
        <VictoryModal
          onClose={() => setIsVictoryOpen(false)}
          coupons={Object.values(discoveredCodes).filter(Boolean) as DiscoveredCoupon[]}
        />
      )}
    </div>
  );
};

const MuseumApp: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<'museum' | 'canopy'>('museum');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  
  const [visitorName, setVisitorName] = useState<string>(() => {
    return localStorage.getItem('at30_visitor_name') || 'Curator Vance';
  });

  const [avatarColor, setAvatarColor] = useState<string>(() => {
    return localStorage.getItem('at30_avatar_color') || '#00F0FF';
  });

  const handleOpenRegistration = () => {
    setIsNameModalOpen(true);
  };

  const handleEnterMuseum = () => {
    setSelectedExperience('museum');
    setIsNameModalOpen(true);
  };
  const handleEnterCanopy = () => { setSelectedExperience('canopy'); setIsNameModalOpen(true); };

  const handleConfirmProfile = (name: string, color: string) => {
    // This handler runs directly from the player's Continue button, satisfying the
    // browser's user-activation requirement for an enterprise-style immersive game view.
    if (!document.fullscreenElement && typeof document.documentElement.requestFullscreen === 'function') {
      void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
        // iPhone and embedded browsers may not expose element fullscreen; the visual-
        // viewport sizing path below remains fully edge-to-edge within the browser.
      });
    }
    setVisitorName(name);
    setAvatarColor(color);
    setIsNameModalOpen(false);
    setHasEntered(true);
    telemetry.trackSessionStart(name);
    void visitorStats.recordGamePlay(selectedExperience === 'canopy' ? 'canopy_run' : 'museum');
  };


  const handleExitToReception = () => {
    setHasEntered(false);
    let count = 0;
    try {
      const saved = localStorage.getItem('at30_discovered_coupons');
      if (saved) {
        count = Object.values(JSON.parse(saved)).filter(Boolean).length;
      }
    } catch {}
    telemetry.trackSessionEnd(count);
  };

  return (
    <>
      {!hasEntered ? (
        <LandingPage
          savedName={visitorName}
          savedColor={avatarColor}
          onEnter={handleEnterMuseum}
          onEnterCanopy={handleEnterCanopy}
          onRequestCustomize={handleOpenRegistration}
        />
      ) : (
        selectedExperience === 'museum' ? <MuseumExperience
          visitorName={visitorName}
          avatarColor={avatarColor}
          onExitToReception={handleExitToReception}
        /> : <CanopyRunExperience visitorName={visitorName} avatarColor={avatarColor} onExit={handleExitToReception} />
      )}

      {isNameModalOpen && (
        <NameSelectModal
          initialName={visitorName}
          initialColor={avatarColor}
          destination={selectedExperience}
          onConfirm={handleConfirmProfile}
          onClose={() => setIsNameModalOpen(false)}
        />
      )}
    </>
  );
};

export const App: React.FC = () => {
  const route = window.location.pathname.replace(/\/$/, '') || '/';
  if (route === '/privacy') return <LegalPage type="privacy" />;
  if (route === '/terms') return <LegalPage type="terms" />;
  return <MuseumApp />;
};

export default App;
