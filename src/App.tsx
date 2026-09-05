import React, { Suspense, useEffect, useState } from 'react';
import { telemetry } from './services/TelemetryService';
import { LandingPage } from './components/LandingPage';
import { NameSelectModal } from './components/NameSelectModal';
import { ExperienceLoader } from './components/ExperienceLoader';
import { visitorStats } from './services/VisitorStatsService';

// Lazy-load heavy 3D experiences so the initial landing page bundle remains ultra-light
const MuseumExperience = React.lazy(() => import('./components/MuseumExperience'));
const CanopyRunExperience = React.lazy(() => import('./components/CanopyRunExperience').then(m => ({ default: m.CanopyRunExperience })));
const LegalPage = React.lazy(() => import('./components/LegalPage').then(m => ({ default: m.LegalPage })));
const PartnersPage = React.lazy(() => import('./components/PartnersPage').then(m => ({ default: m.PartnersPage })));

// Prefetch helper to download 3D experiences in the idle background
export const prefetch3DExperiences = () => {
  void import('./components/MuseumExperience');
  void import('./components/CanopyRunExperience');
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

  // Start prefetching 3D engines when user is idle on the landing page
  useEffect(() => {
    const idleTimer = window.setTimeout(() => {
      prefetch3DExperiences();
    }, 2000);
    return () => window.clearTimeout(idleTimer);
  }, []);

  const handleOpenRegistration = () => {
    prefetch3DExperiences();
    setIsNameModalOpen(true);
  };

  const handleEnterMuseum = () => {
    prefetch3DExperiences();
    setSelectedExperience('museum');
    setIsNameModalOpen(true);
  };

  const handleEnterCanopy = () => {
    prefetch3DExperiences();
    setSelectedExperience('canopy');
    setIsNameModalOpen(true);
  };

  const handleConfirmProfile = (name: string, color: string) => {
    if (!document.fullscreenElement && typeof document.documentElement.requestFullscreen === 'function') {
      void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
        // Fullscreen fallback for browsers without element-level requestFullscreen
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
        <Suspense
          fallback={
            <ExperienceLoader
              title={selectedExperience === 'canopy' ? 'Entering Canopy Run' : 'Entering Digital Museum'}
              subtitle="Preparing 3D environment and assets..."
            />
          }
        >
          {selectedExperience === 'museum' ? (
            <MuseumExperience
              visitorName={visitorName}
              avatarColor={avatarColor}
              onExitToReception={handleExitToReception}
            />
          ) : (
            <CanopyRunExperience
              visitorName={visitorName}
              avatarColor={avatarColor}
              onExit={handleExitToReception}
            />
          )}
        </Suspense>
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
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname.replace(/\/$/, '') || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.replace(/\/$/, '') || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/privacy') {
    return (
      <Suspense fallback={<ExperienceLoader title="Loading Legal Documentation" subtitle="Please wait..." />}>
        <LegalPage type="privacy" />
      </Suspense>
    );
  }
  if (currentPath === '/terms') {
    return (
      <Suspense fallback={<ExperienceLoader title="Loading Legal Documentation" subtitle="Please wait..." />}>
        <LegalPage type="terms" />
      </Suspense>
    );
  }
  if (currentPath === '/partners') {
    return (
      <Suspense fallback={<ExperienceLoader title="Loading Partner & Sponsor Hub" subtitle="Please wait..." />}>
        <PartnersPage />
      </Suspense>
    );
  }
  return <MuseumApp />;
};

export default App;
