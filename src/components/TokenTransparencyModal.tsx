import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Lock,
  Scale,
  Shield,
  X,
  Coins
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface TokenTransparencyModalProps {
  onClose: () => void;
  contractAddress?: string;
}

export const TokenTransparencyModal: React.FC<TokenTransparencyModalProps> = ({
  onClose,
  contractAddress = ''
}) => {
  const [copied, setCopied] = useState(false);

  // In production, when the contract address is deployed, it can be set via props or localStorage
  const activeCA =
    contractAddress ||
    localStorage.getItem('any30_official_ca') ||
    localStorage.getItem('at30_official_ca') ||
    '';

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = () => {
    if (!activeCA) return;
    soundEngine.playClick();
    navigator.clipboard.writeText(activeCA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    soundEngine.playClick();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-[#0C0F17]/95 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#121726] via-[#1A2238] to-[#0F1424] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Community Transparency &amp; Disclaimers</span>
              </div>
              <h2 id="token-modal-title" className="text-xl font-black text-white tracking-tight">
                Any30 Token Policy &amp; Public Disclosures
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close disclosures"
            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-sm custom-scrollbar">
          {/* Independence / Free Access Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-emerald-950/30 border border-cyan-500/30 flex items-start gap-3.5">
            <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-cyan-200 leading-relaxed">
              <strong className="block text-white text-sm mb-1 font-bold">
                100% Free Experience — Zero Token Requirement
              </strong>
              The Any30 Digital Museum is completely free to enter, explore, and play in any modern browser. The{' '}
              <strong className="text-white">$ANY30</strong> token is an optional decentralized community coin on Solana. Visitors do{' '}
              <strong>not</strong> need to purchase or hold $ANY30 to enter the museum, inspect exhibits, solve puzzles, or claim sponsor gifts.
            </div>
          </div>

          {/* Official Contract Address Slot */}
          <div className="p-4 rounded-2xl bg-black/70 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Official Solana Contract Address
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                Pump.fun / Solana
              </span>
            </div>

            {activeCA ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-cyan-500/30 font-mono text-xs text-cyan-300 break-all">
                  <span className="flex-1 select-all">{activeCA}</span>
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 active:scale-95"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy CA'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href={`https://pump.fun/coin/${activeCA}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                  >
                    <span>View on Pump.fun</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                  <a
                    href={`https://dexscreener.com/solana/${activeCA}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                  >
                    <span>DexScreener</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                  <a
                    href={`https://solscan.io/token/${activeCA}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                  >
                    <span>Solscan</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-dashed border-white/20 text-center text-xs text-gray-400">
                Official contract address will be broadcast here upon live launch on Pump.fun. Always verify the address on{' '}
                <strong className="text-white">any30.com</strong> to protect against fake imitator tokens.
              </div>
            )}
          </div>

          {/* Core Principles & Disclosures */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Core Disclosures &amp; Policies</h3>

            <div className="grid gap-2.5">
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white block text-sm mb-0.5">No Pay-to-Win or Purchase Advantages</strong>
                  Holding or trading $ANY30 gives <em>zero</em> competitive advantage in finding museum rewards, solving clues, or winning seasonal competitions. All gift discoveries are earned strictly through voluntary gameplay and exploration.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white block text-sm mb-0.5">No Equity, Dividends, or Profit Expectations</strong>
                  $ANY30 is a speculative community utility and meme asset. It conveys no equity, company shares, profit distributions, intellectual property rights, or governance control over Any30 platform operations.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white block text-sm mb-0.5">Transparent Creator Fees</strong>
                  Any creator fees generated via token bonding curves are allocated toward infrastructure costs: WebGL hosting, GPU asset pipelines, multiplayer server bandwidth, and new seasonal 3D environment curation.
                </div>
              </div>
            </div>
          </div>

          {/* Anti-Scam Security Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <strong className="text-amber-300">Official Anti-Scam Advisory:</strong> The Any30 team will{' '}
              <strong>never</strong> direct message (DM) you first asking for wallet seed phrases, private keys, or funds. Never interact with unsolicited token contracts claiming to be associated with Any30.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0A0D14] flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-mono">
            Any30 Museum Protocol · 2026 Disclosures
          </span>
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Disclosures
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenTransparencyModal;
