import React, { useState } from 'react';
import type { ExhibitItem, DiscoveredCoupon } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ONLINE_MASTERPIECES } from '../data/artworks';
import { X, Sparkles, Copy, Check, ExternalLink, Key, Eye, Tv, Cpu, Palette } from 'lucide-react';

interface ExhibitModalProps {
  exhibit: ExhibitItem;
  isAlreadyClaimed: boolean;
  onClose: () => void;
  onClaimCoupon: (coupon: DiscoveredCoupon) => void;
}

export const ExhibitModal: React.FC<ExhibitModalProps> = ({
  exhibit,
  isAlreadyClaimed,
  onClose,
  onClaimCoupon
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(isAlreadyClaimed);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [activeArtIndex, setActiveArtIndex] = useState<number>(0);

  const handleSolvePuzzle = () => {
    soundEngine.playClick();
    setIsSolving(true);

    setTimeout(() => {
      setIsSolving(false);
      setIsRevealed(true);
      soundEngine.playCouponUnlock();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [exhibit.themeColor, '#00F0FF', '#FFD700', '#FFFFFF']
      });

      const coupon: DiscoveredCoupon = {
        brandKey: exhibit.brandKey,
        brandName: exhibit.brandName,
        title: exhibit.title,
        code: exhibit.couponCode,
        discount: exhibit.couponDiscount,
        redeemUrl: exhibit.redeemUrl,
        discoveredAt: new Date().toLocaleDateString()
      };
      onClaimCoupon(coupon);
    }, 600);
  };

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(exhibit.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentArt = ONLINE_MASTERPIECES[activeArtIndex % ONLINE_MASTERPIECES.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#10141E]/95 shadow-2xl text-white">
        
        {/* Top Header with Brand Gradient */}
        <div
          className="relative px-6 py-5 flex items-center justify-between border-b border-white/10"
          style={{ background: exhibit.bannerGradient }}
        >
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-black/30 backdrop-blur-sm">
              {exhibit.brandKey === 'posterbooking' && <Tv className="w-6 h-6 text-cyan-300" />}
              {exhibit.brandKey === 'clayrent' && <Key className="w-6 h-6 text-amber-300" />}
              {exhibit.brandKey === 'leadmagic' && <Cpu className="w-6 h-6 text-purple-300" />}
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-white/80">
                {exhibit.wing}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {exhibit.brandName} — {exhibit.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* DIGITAL SIGNAGE & ARTWORK DISPLAY SHOWCASE */}
          {exhibit.brandKey === 'posterbooking' && (
            <div className="rounded-xl border border-white/15 overflow-hidden bg-black/60 shadow-xl space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
                  <Palette className="w-4 h-4" />
                  <span>POSTERBOOKING LIVE 8K DIGITAL CANVAS & ART PLAYLIST</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveArtIndex(idx);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        activeArtIndex === idx
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300'
                      }`}
                    >
                      Art #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Signage Screen Mockup */}
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-950 aspect-video flex flex-col justify-between p-4 shadow-inner">
                {/* Background Artwork */}
                <img
                  src={currentArt.imageUrl}
                  alt={currentArt.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-500"
                />

                {/* Glass Art Overlay Badge */}
                <div className="relative z-10 bg-black/70 backdrop-blur-md border border-white/20 p-3 rounded-lg max-w-sm">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    ● Broadcasting on PosterBooking Display #PB-884
                  </div>
                  <div className="font-serif text-sm font-bold text-white">
                    {currentArt.title} ({currentArt.year})
                  </div>
                  <div className="text-xs text-gray-300">
                    {currentArt.artist} • {currentArt.location}
                  </div>
                </div>

                {/* Bottom ticker banner on screen */}
                <div className="relative z-10 bg-black/80 backdrop-blur-md border-t border-white/15 px-3 py-1.5 rounded-md flex items-center justify-between text-[11px] text-gray-300 font-mono">
                  <span>POSTERBOOKING CLOUD SYNC: 100% ONLINE</span>
                  <span className="text-cyan-400 font-bold">ANY TV • FIRESTICK • ANDROID • PI</span>
                </div>
              </div>
            </div>
          )}

          {/* Brand Tagline & Overview */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <div className="text-sm font-medium text-cyan-400">
              💡 {exhibit.brandTagline}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {exhibit.detailedStory}
            </p>
          </div>

          {/* Key Capabilities / Features Pills */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Platform Innovations:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exhibit.features.map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-gray-200 bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Clue & Scavenger Quest Section */}
          <div className="p-5 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Museum Quest Discovery</span>
              </div>
              {isRevealed ? (
                <span className="px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full">
                  ✓ Unlocked & Saved to Passport
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 rounded-full">
                  🔍 Hidden Clue
                </span>
              )}
            </div>

            <p className="text-xs text-gray-300">
              {exhibit.clueHint}
            </p>

            {!isRevealed ? (
              <button
                onClick={handleSolvePuzzle}
                disabled={isSolving}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black flex items-center justify-center space-x-2 transition-all transform active:scale-95 shadow-lg cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #00F0FF 0%, #0077FE 100%)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
                }}
              >
                {isSolving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Decode Clue & Reveal {exhibit.brandName} Voucher</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0E1526] to-[#141E34] border border-cyan-400/40 space-y-3.5 animate-fade-in shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Unlocked VIP Voucher:</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    Saved in Passport
                  </span>
                </div>

                <div className="text-sm font-black text-white bg-black/40 p-3 rounded-xl border border-white/10">
                  {exhibit.couponDiscount}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-black/70 border border-white/15">
                  <div className="text-center sm:text-left w-full sm:w-auto">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Passkey Promo Code:</div>
                    <div className="font-mono text-lg font-black text-cyan-300 tracking-wider">
                      {exhibit.couponCode}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopy}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>

                    <a
                      href={exhibit.redeemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/15 cursor-pointer"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>At30 Virtual Brand Experience</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
