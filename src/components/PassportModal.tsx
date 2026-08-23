import React, { useState } from 'react';
import type { BrandKey, DiscoveredCoupon } from '../types';
import { soundEngine } from '../utils/audio';
import { X, Gift, Copy, Check, ExternalLink, Sparkles, Lock, Trophy, ShieldCheck, Tag } from 'lucide-react';
import { telemetry } from '../services/TelemetryService';

interface PassportModalProps {
  visitorName?: string;
  discoveredCodes: Record<BrandKey, DiscoveredCoupon | null>;
  onClose: () => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  visitorName = 'Curator',
  discoveredCodes,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const brands: {
    key: BrandKey;
    name: string;
    wing: string;
    color: string;
    codeDefault: string;
    perkDefault: string;
    redeemUrl: string;
    roomHint: string;
  }[] = [
    {
      key: 'posterbooking',
      name: 'PosterBooking',
      wing: 'Digital Canvas Wing (East)',
      color: '#0066FF',
      codeDefault: 'POSTERBOOKING30',
      perkDefault: '30% Off All Annual Pro Screens + 3 Free Screens Forever',
      redeemUrl: 'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest',
      roomHint: 'Explore through the East Wing Lobby & Gallery to the Inner Sanctum 8K Canvas.'
    },
    {
      key: 'clayrent',
      name: 'ClayRent',
      wing: 'Modern Habitat Pavilion (North)',
      color: '#E06D53',
      codeDefault: 'CLAYRENT2026',
      perkDefault: '$100 Credit Towards Your First Luxury Rental Booking',
      redeemUrl: 'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest',
      roomHint: 'Explore through the North Wing Hallways to the Architectural Blueprint Sanctum.'
    },
    {
      key: 'leadmagic',
      name: 'LeadMagic',
      wing: 'AI Intelligence Vault (West)',
      color: '#A855F7',
      codeDefault: 'LEADMAGICVIP',
      perkDefault: '5,000 Free B2B Lead Enrichment Credits + 20% Off Growth Plan',
      redeemUrl: 'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest',
      roomHint: 'Explore through the West Wing Corridors to the AI Data Crystal Sanctum.'
    }
  ];

  const totalCollected = Object.values(discoveredCodes).filter(Boolean).length;
  const isComplete = totalCollected === 3;

  const handleCopy = (brandKey: BrandKey, code: string) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    telemetry.trackCouponCopied(brandKey, code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRedeemClick = (brandKey: BrandKey, url: string) => {
    telemetry.trackBrandOutboundClicked(brandKey, url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-[#0E121E]/95 shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#141A29] via-[#1A2338] to-[#121624] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Visitor: {visitorName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Museum passport
                {isComplete && <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2.5 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest Progress Meter */}
        <div className="px-6 py-3.5 bg-black/50 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
            <span>Collection progress</span>
            <span className="text-gray-500">•</span>
            <span className="text-cyan-400">{totalCollected} of 3 Perks Unlocked</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-32 sm:w-48 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 via-amber-400 to-purple-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#00F0FF]"
                style={{ width: `${(totalCollected / 3) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs font-black text-cyan-300">
              {Math.round((totalCollected / 3) * 100)}%
            </span>
          </div>
        </div>

        {/* Brand Vouchers List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {brands.map(brand => {
            const coupon = discoveredCodes[brand.key];
            const isUnlocked = Boolean(coupon);
            const activeCode = coupon?.code || brand.codeDefault;
            const activeDiscount = coupon?.discount || brand.perkDefault;
            const redeemUrl = coupon?.redeemUrl || brand.redeemUrl;

            return (
              <div
                key={brand.key}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-[#121726]/90 border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'bg-white/[0.02] border-white/10 opacity-75'
                }`}
              >
                {/* Brand Title & Wing Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-md"
                      style={{
                        background: brand.color,
                        boxShadow: `0 0 10px ${brand.color}`
                      }}
                    />
                    <div>
                      <div className="font-black text-base text-white">
                        {brand.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {brand.wing}
                      </div>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span>UNLOCKED & VERIFIED</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300/80 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Explore Wing to Unlock</span>
                    </span>
                  )}
                </div>

                {/* Offer Discount Highlight Banner */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-3 flex items-start gap-2.5">
                  <Tag className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold text-gray-200 leading-snug">
                    <strong className="text-white">{activeDiscount}</strong>
                  </div>
                </div>

                {/* Code & Actions Box */}
                {isUnlocked ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-black/70 border border-cyan-500/30">
                    <div className="w-full sm:w-auto text-center sm:text-left">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Reward code
                      </div>
                      <div className="font-mono text-base font-black text-cyan-300 tracking-wider">
                        {activeCode}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleCopy(brand.key, activeCode)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        {copiedCode === activeCode ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedCode === activeCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>

                      <a
                        href={redeemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleRedeemClick(brand.key, redeemUrl)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/15 cursor-pointer"
                      >
                        <span>Redeem</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span>{brand.roomHint}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Progress automatically synced to your browser profile</span>
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
