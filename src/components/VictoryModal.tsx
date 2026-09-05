import React, { useEffect, useMemo, useState } from 'react';
import type { DiscoveredCoupon } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, X, CheckCircle, Copy, Share2, Check } from 'lucide-react';

interface VictoryModalProps {
  onClose: () => void;
  coupons: DiscoveredCoupon[];
  visitorName?: string;
  durationSeconds?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  onClose,
  coupons,
  visitorName = 'Curator',
  durationSeconds = 240
}) => {
  const [copied, setCopied] = useState(false);

  // Compute deterministic curator pass number
  const curatorNumber = useMemo(() => {
    const raw = visitorName.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
    return String(Math.abs(raw % 900 + 100)).padStart(3, '0');
  }, [visitorName]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [durationSeconds]);

  // Generate Wordle-Style share text
  const shareText = useMemo(() => {
    return `Any30 Museum · Hunt 001\n🟦🟦🟦\n3/3 Gifts Discovered\n⏱️ ${formattedTime} · Founding Curator #${curatorNumber}\n\nCan you find the hidden gifts faster?\nPlay free in browser 👉 https://any30.com`;
  }, [formattedTime, curatorNumber]);

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

  const handleCopyCard = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareX = () => {
    soundEngine.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-[#0E121E] shadow-[0_0_50px_rgba(251,191,36,0.3)] text-white text-center p-6 sm:p-8 space-y-5">
        
        {/* Glow Ring Behind Trophy */}
        <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 flex items-center justify-center shadow-[0_0_30px_#F59E0B] animate-pulse">
          <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Founding Curator #{curatorNumber}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Collection Complete!
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md mx-auto">
            You solved all clues in <strong>{formattedTime}</strong> and unlocked all 3 hidden brand rewards!
          </p>
        </div>

        {/* Viral Wordle-Style Shareable Score Card */}
        <div className="p-4 rounded-2xl bg-black/70 border border-cyan-500/30 text-left font-mono text-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold border-b border-white/10 pb-1.5">
            <span>ANY30 MUSEUM · HUNT 001</span>
            <span>CURATOR #{curatorNumber}</span>
          </div>
          <div className="text-lg tracking-widest text-cyan-400 py-0.5">
            🟦 🟦 🟦
          </div>
          <div className="text-gray-300 text-[11px] flex justify-between">
            <span>3/3 Gifts Unlocked</span>
            <span>Time: <strong>{formattedTime}</strong></span>
          </div>
          <div className="pt-2 flex gap-2">
            <button
              onClick={handleCopyCard}
              className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Card Copied!' : 'Copy Result Card'}</span>
            </button>
            <button
              onClick={handleShareX}
              className="py-2 px-4 rounded-lg bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/40 text-[#1DA1F2] font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share on X</span>
            </button>
          </div>
        </div>

        {/* Brand Summary Cards */}
        <div className="space-y-2 text-left max-h-36 overflow-y-auto custom-scrollbar">
          {coupons.map((c, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-xs text-white truncate">{c.brandName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{c.discount}</div>
                </div>
              </div>
              <div className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
                {c.code}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-xs transition-all shadow-lg cursor-pointer"
          >
            Open Passport &amp; Redeem All
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

export default VictoryModal;
