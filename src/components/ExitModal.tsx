import React, { useEffect } from 'react';
import type { BrandKey, DiscoveredCoupon } from '../types';
import { soundEngine } from '../utils/audio';
import { LogOut, X, ShieldCheck, Gift, Compass } from 'lucide-react';

interface ExitModalProps {
  visitorName: string;
  discoveredCodes: Record<BrandKey, DiscoveredCoupon | null>;
  onConfirmExit: () => void;
  onCancel: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  visitorName,
  discoveredCodes,
  onConfirmExit,
  onCancel
}) => {
  const totalUnlocked = Object.values(discoveredCodes).filter(Boolean).length;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onCancel();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title" className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#0E121E]/95 shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-black/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                Exit Exhibition
              </div>
              <h2 id="exit-dialog-title" className="text-lg font-black tracking-tight text-white">
                Leave At30 Pavilion?
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onCancel();
            }}
            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close exit confirmation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-300 leading-relaxed">
            Goodbye for now, <strong className="text-white">{visitorName}</strong>. You can return to the main reception lounge at any time.
          </p>

          {/* Session Progress Summary Card */}
          <div className="p-4 rounded-2xl border border-white/10 bg-black/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-cyan-400" />
                Vouchers Collected
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {totalUnlocked} / 3 Unlocked
              </span>
            </div>

            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(totalUnlocked / 3) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>All discovered promo codes remain saved in your browser Passport.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onCancel();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/10 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Resume Exploring</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onConfirmExit();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit to Reception</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
