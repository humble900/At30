import React from 'react';
import { soundEngine } from '../utils/audio';
import { X, Navigation, Gift } from 'lucide-react';

interface ControlsOverlayProps {
  onClose: () => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0F131E]/95 shadow-2xl text-white p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">How to Explore At30</h3>
              <p className="text-xs text-gray-400">Visitor navigation & quest guide</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            🖥️ Desktop Controls
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Move Around</span>
              <span className="font-mono px-2 py-0.5 bg-white/10 rounded font-bold text-cyan-300">W A S D / Arrows</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Sprint / Run</span>
              <span className="font-mono px-2 py-0.5 bg-white/10 rounded font-bold text-cyan-300">Shift</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Look Around</span>
              <span className="font-mono px-2 py-0.5 bg-white/10 rounded font-bold text-cyan-300">Click & Drag</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Inspect Exhibit</span>
              <span className="font-mono px-2 py-0.5 bg-white/10 rounded font-bold text-cyan-300">[E] or Click</span>
            </div>
          </div>
        </div>

        {/* Quest Objectives */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-2 text-xs text-gray-300">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Gift className="w-4 h-4" />
            <span>The Scavenger Quest:</span>
          </div>
          <p>
            1. Visit the 3 Grand Gallery Wings: <strong>PosterBooking</strong> (East), <strong>ClayRent</strong> (North), and <strong>LeadMagic</strong> (West).
          </p>
          <p>
            2. Approach exhibits and press <strong>[E]</strong> to inspect clues.
          </p>
          <p>
            3. Solve each clue to unlock real-life promo coupon codes saved to your Passport!
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors cursor-pointer"
        >
          Got It, Let's Explore!
        </button>
      </div>
    </div>
  );
};
