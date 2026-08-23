import React, { useRef, useState } from 'react';

interface MobileJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [touching, setTouching] = useState(false);

  const maxRadius = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouching(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const touch = e.touches[0];
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: clampedX, y: clampedY });
    onMove(clampedX / maxRadius, clampedY / maxRadius);
  };

  const handleTouchEnd = () => {
    setTouching(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-32 h-32 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-md flex items-center justify-center select-none touch-none shadow-2xl"
    >
      {/* Center Draggable Knob */}
      <div
        className={`w-14 h-14 rounded-full bg-cyan-500 border border-white/40 transform transition-transform duration-75 flex items-center justify-center ${
          touching ? 'scale-105' : ''
        }`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
      />
    </div>
  );
};
