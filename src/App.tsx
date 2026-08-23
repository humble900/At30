import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MuseumScene } from './engine/MuseumScene';
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
import { LandingPage } from './components/LandingPage';
import { soundEngine } from './utils/audio';

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

  // Game & Quest State
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

  const [isNearExit, setIsNearExit] = useState<boolean>(false);
  const isNearExitRef = useRef<boolean>(false);
  isNearExitRef.current = isNearExit;

  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitItem | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isExitOpen, setIsExitOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [hasTriggeredVictory, setHasTriggeredVictory] = useState<boolean>(() => localStorage.getItem('at30_victory_seen') === 'true');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const isOverlayOpenRef = useRef(false);

  useEffect(() => {
    isOverlayOpenRef.current = Boolean(selectedExhibit || isPassportOpen || isHelpOpen || isExitOpen || isVictoryOpen);
  }, [selectedExhibit, isPassportOpen, isHelpOpen, isExitOpen, isVictoryOpen]);
  
  const [playerPos, setPlayerPos] = useState<PlayerPosition>({
    x: 0,
    y: 0,
    z: 13.5,
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

    const width = window.innerWidth;
    const height = window.innerHeight;

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
    camera.position.set(0, 3, 20);

    // 3. Scene & World
    const museumScene = new MuseumScene();
    sceneInstanceRef.current = museumScene;

    // 4. Avatar (with customized name and suit color)
    const avatar = new Avatar(avatarColor, visitorName);
    museumScene.scene.add(avatar.group);

    // 5. Controller
    const controller = new PlayerController(
      avatar,
      camera,
      renderer.domElement,
      museumScene.collisionBoxes
    );
    controllerRef.current = controller;

    // Proximity checking throttle timer
    let lastProximityCheck = 0;
    const clock = new THREE.Clock();

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Update Controller & Camera
      controller.update(delta);

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

        // Proximity detection to exhibits (within 4.2 meters)
        let closest: ExhibitItem | null = null;
        let minDistance = 4.2;

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
      }

      renderer.render(museumScene.scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

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
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      controller.dispose();
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
      
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Modern Glassmorphic HUD */}
      <HUD
        visitorName={visitorName}
        avatarColor={avatarColor}
        discoveredCodes={discoveredCodes}
        nearbyExhibit={nearbyExhibit}
        isNearExit={isNearExit}
        playerPos={playerPos}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenExit={() => setIsExitOpen(true)}
        onInspectExhibit={(ex) => setSelectedExhibit(ex)}
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

export const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(() => Boolean(localStorage.getItem('at30_visitor_name')));
  
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
    if (hasSavedProfile) {
      setHasEntered(true);
    } else {
      setIsNameModalOpen(true);
    }
  };

  const handleConfirmProfile = (name: string, color: string) => {
    setVisitorName(name);
    setAvatarColor(color);
    setHasSavedProfile(true);
    setIsNameModalOpen(false);
    setHasEntered(true);
  };

  const handleExitToReception = () => {
    setHasEntered(false);
  };

  return (
    <>
      {!hasEntered ? (
        <LandingPage
          savedName={visitorName}
          savedColor={avatarColor}
          onEnter={handleEnterMuseum}
          onRequestCustomize={handleOpenRegistration}
        />
      ) : (
        <MuseumExperience
          visitorName={visitorName}
          avatarColor={avatarColor}
          onExitToReception={handleExitToReception}
        />
      )}

      {isNameModalOpen && (
        <NameSelectModal
          initialName={visitorName}
          initialColor={avatarColor}
          onConfirm={handleConfirmProfile}
          onClose={() => setIsNameModalOpen(false)}
        />
      )}
    </>
  );
};

export default App;
