import React, { useRef, useState } from 'react';

interface MobileJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const MobileJoystick: React.FC<MobileJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [touching, setTouching] = useState(false);

  const maxRadius = 45;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setTouching(true);
    updatePosition(e.clientX, e.clientY);
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: clampedX, y: clampedY });
    onMove(clampedX / maxRadius, clampedY / maxRadius);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touching) updatePosition(e.clientX, e.clientY);
  };

  const handleTouchEnd = () => {
    setTouching(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handleTouchEnd}
      onPointerCancel={handleTouchEnd}
      className={`mobile-joystick ${touching ? 'active' : ''}`}
      aria-label="Move avatar"
    >
      {/* Center Draggable Knob */}
      <div
        className="mobile-joystick__knob"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
      />
    </div>
  );
};
