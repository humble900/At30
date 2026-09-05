import React from 'react';
import type { BrandKey, DiscoveredCoupon, PlayerPosition } from '../types';
import './MuseumUI.css';

interface MiniMapProps { playerPos: PlayerPosition; discoveredCodes: Record<BrandKey, DiscoveredCoupon | null>; }

export const MiniMap: React.FC<MiniMapProps> = ({ playerPos, discoveredCodes }) => {
  const clamp = (value: number) => Math.max(5, Math.min(95, ((value + 72) / 144) * 100));
  return (
    <aside className="simple-map" aria-label="Museum map">
      <header><strong>Museum map</strong><span>{Object.values(discoveredCodes).filter(Boolean).length}/3</span></header>
      <div className="map-canvas">
        <div className="map-atrium">ATRIUM</div>
        <div className="map-wing map-east"><b>CANVAS</b><i className={discoveredCodes.ripplepos ? 'found' : ''}>✓</i></div>
        <div className="map-wing map-north"><b>HABITAT</b><i className={discoveredCodes.clayrent ? 'found' : ''}>✓</i></div>
        <div className="map-wing map-west"><b>VAULT</b><i className={discoveredCodes.filedcrews ? 'found' : ''}>✓</i></div>
        <div className="map-exit">EXIT</div>
        <div className="map-player" style={{ left: `${clamp(playerPos.x)}%`, top: `${clamp(playerPos.z)}%`, transform: `translate(-50%,-50%) rotate(${playerPos.rotationY + Math.PI}rad)` }} />
      </div>
    </aside>
  );
};
