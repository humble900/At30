import React, { useEffect } from 'react';
import type { DiscoveredCoupon } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, X, CheckCircle } from 'lucide-react';

interface VictoryModalProps {
  onClose: () => void;
  coupons: DiscoveredCoupon[];
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onClose, coupons }) => {
  useEffect(() => {
    soundEngine.playVictoryFanfare();

    // Multi-stage confetti celebration
    const end = Date.now() + 3000;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-[#0E121E] shadow-[0_0_50px_rgba(251,191,36,0.3)] text-white text-center p-6 sm:p-8 space-y-6">
        
        {/* Glow Ring Behind Trophy */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 flex items-center justify-center shadow-[0_0_30px_#F59E0B] animate-pulse">
          <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-300" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Scavenger Complete</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Congratulations, Innovation Champion!
          </h2>
          <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
            You successfully navigated the <strong>At30 Pavilion</strong> and discovered all 3 exclusive brand vouchers!
          </p>
        </div>

        {/* Brand Summary Cards */}
        <div className="space-y-2 text-left">
          {coupons.map((c, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">{c.brandName}</div>
                  <div className="text-xs text-gray-400">{c.discount}</div>
                </div>
              </div>
              <div className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
                {c.code}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm transition-all shadow-lg cursor-pointer"
          >
            Claim All in Passport
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
