import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Compass,
  Gamepad2,
  Gift,
  Globe2,
  Leaf,
  Lock,
  Palette,
  Scale,
  Sparkles,
  User
} from 'lucide-react';
import museumCoverImage from '../assets/museum-hero-cover.jpg';
import touchGrassImage from '../assets/touch-grass-preview.webp';
import { visitorStats, type PlatformPublicStats } from '../services/VisitorStatsService';
import { TokenTransparencyModal } from './TokenTransparencyModal';
import './LandingPage.css';

type LandingPageProps = {
  savedName: string;
  savedColor: string;
  onEnter: () => void;
  onEnterCanopy?: () => void;
  onRequestCustomize: () => void;
};


const activeRewards = [
  {
    id: 'VAULT-01',
    title: 'Live Launch Community Mystery Gift',
    badge: 'ACTIVE QUEST',
    value: '$10 Digital Gift Card',
    sponsor: 'Any30 Launch Mystery',
    location: 'Gallery Corridors · Physical Exhibit',
    hint: 'Inspect the central physical 3D exhibit to decrypt coordinates.',
    tier: 'TIER 1 ARTIFACT'
  },
  {
    id: 'VAULT-02',
    title: 'Cloud POS & Screen Hardware Voucher',
    badge: 'FOUNDING PARTNER',
    value: '30% Off + 3 Mo Cloud',
    sponsor: 'RipplePOS',
    location: 'East Wing · 8K Digital Canvas',
    hint: 'Decodable on the interactive digital display in the east gallery.',
    tier: 'HARDWARE PASS'
  },
  {
    id: 'VAULT-03',
    title: 'Luxury Habitat Booking Credit',
    badge: 'SIGNAGE SPONSOR',
    value: '$100 Rental Credit',
    sponsor: 'ClayRent',
    location: 'Reception · Modern Habitat Showcase',
    hint: 'Encoded inside the architectural reception totem display.',
    tier: 'CREDIT VOUCHER'
  },
  {
    id: 'VAULT-04',
    title: 'Field Workforce Accelerator Pass',
    badge: 'SIGNAGE SPONSOR',
    value: '30% Off Annual Plan',
    sponsor: 'FiledCrews',
    location: 'Command Chamber · Terminal Matrix',
    hint: 'Available upon scanning the operations terminal matrix.',
    tier: 'ACCELERATOR PASS'
  }
];


const questions = [
  { question: 'What is Any30?', answer: 'Any30 is the playable Museum of Gifts. It is a browser-based 3D multiplayer world where visitors explore themed exhibits, solve clues, and unlock real brand rewards, coupons, and community prizes.' },
  { question: 'Do I need to download an app or connect a wallet?', answer: 'No. Any30 runs directly in your web browser with zero downloads, zero extensions, and zero wallet connections. It is 100% free to enter and play.' },
  { question: 'How do I win gifts?', answer: 'Walk up to exhibits inside the museum and press "Inspect" (or tap on mobile). Read the exhibit story, follow the clue, and solve the interactive mini-puzzle to unlock the reward in your museum passport.' },
  { question: 'What is the $Any30 token?', answer: 'The $Any30 community token is completely optional. You do NOT need $Any30 to play the museum, enter galleries, or win gifts. It provides no equity, no guaranteed return, and buying it does not improve your winning odds.' },
  { question: 'Can my company sponsor a gift or book an ad?', answer: 'Yes! Brands, creators, and projects can sponsor a hidden gift or book digital signage displays on our dedicated /partners page.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  savedName,
  savedColor,
  onEnter,
  onRequestCustomize
}) => {
  const [stats, setStats] = useState<PlatformPublicStats>(() => visitorStats.getStats());
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  useEffect(() => {
    void visitorStats.recordSiteVisit().then(setStats);
    const unsubscribe = visitorStats.subscribe(setStats);
    return unsubscribe;
  }, []);

  return (
    <main className="landing-shell">
      {/* Primary Navigation */}
      <nav className="landing-nav" aria-label="Primary navigation">
        <a className="brand-mark" href="#top" aria-label="Any30 home">
          <span className="brand-glyph"><span /></span>
          <span>Any30</span>
        </a>
        <div className="nav-links">
          <a href="#worlds">Worlds</a>
          <a href="#vault">Gifts Vault</a>
          <a href="/partners">Partners &amp; Ad Spaces</a>
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="text-xs font-semibold text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            <Scale size={13} /> Token Disclosures
          </button>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="nav-stats-chip hidden md:inline-flex" title="Total public visitors who have explored the Any30 platform">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span><strong>{stats.totalVisitors.toLocaleString()}</strong> visitors</span>
          </div>

          {savedName && (
            <button
              onClick={onRequestCustomize}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Change Visitor Name & Avatar"
            >
              <span className="visitor-swatch" style={{ background: savedColor }}><User size={11} /></span>
              <span className="font-semibold truncate max-w-[100px]">{savedName}</span>
              <Palette size={13} className="text-cyan-400 opacity-70" />
            </button>
          )}
          <button className="nav-cta cursor-pointer" onClick={onEnter}>
            Enter Museum <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section: Repositioned as The Playable Museum of Gifts */}
      <section className="landing-hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>THE PLAYABLE MUSEUM OF GIFTS · MULTIPLAYER TREASURE HUNT</span>
          </div>
          <h1>Explore worlds.<br /><em>Find real gifts.</em></h1>
          <p>
            Step into a multiplayer 3D museum directly in your browser. Inspect interactive exhibits,
            solve hidden clues, and unlock real brand rewards, vouchers, and community prizes.
            <span className="hero-next-world">100% Free. No downloads. No wallet required to enter or win.</span>
          </p>

          {/* 3-Step How-It-Works Loop */}
          <div className="hero-how-it-works">
            <div className="step-item">
              <span className="step-num">01</span>
              <div>
                <strong>Enter Free</strong>
                <small>3D world in browser</small>
              </div>
            </div>
            <span className="step-divider">→</span>
            <div className="step-item">
              <span className="step-num">02</span>
              <div>
                <strong>Solve Clues</strong>
                <small>Inspect 3D exhibits</small>
              </div>
            </div>
            <span className="step-divider">→</span>
            <div className="step-item">
              <span className="step-num">03</span>
              <div>
                <strong>Claim Gifts</strong>
                <small>Unlock vouchers &amp; perks</small>
              </div>
            </div>
          </div>

          <div className="hero-social-proof" aria-label="Live platform statistics">
            <div className="proof-pill">
              <span className="live-indicator">
                <span className="live-pulse" />
                <span className="live-dot" />
              </span>
              <Globe2 size={15} className="text-cyan-600" />
              <span><strong>{stats.totalVisitors.toLocaleString()}</strong> explorers have entered</span>
            </div>
            <div className="proof-pill proof-pill--secondary">
              <Gamepad2 size={15} className="text-emerald-600" />
              <span><strong>{stats.totalGamePlays.toLocaleString()}</strong> hunts played</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="primary-cta cursor-pointer" onClick={onEnter}>
              <span className="cta-icon"><Gift size={19} /></span>
              <span>Play Gift Hunt as {savedName || 'Curator'}</span>
              <ArrowRight size={18} />
            </button>
            <button className="text-link cursor-pointer flex items-center gap-1" onClick={onRequestCustomize}>
              <User size={15} /> Customize Avatar <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Preview of the Any30 digital museum">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="visual-halo" />
          <div className="museum-card">
            <div className="card-topline">
              <span>LIVE TREASURE HUNT</span>
              <span>Any30 / 001</span>
            </div>
            <img src={museumCoverImage} alt="Cinematic view inside the Any30 digital museum with glowing exhibits and visitors" />
            <div className="card-caption">
              <div>
                <small>EXPERIENCE 001 · 3 WINGS OPEN</small>
                <strong>The Playable Museum of Gifts</strong>
              </div>
              <Gift size={24} className="text-amber-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Human Founder Story (Witty, Real & Contagious) */}
      <section className="founder-story-section">
        <div className="founder-story-inner">
          <span className="kicker">HOW THIS STARTED</span>
          <h2>A human experiment in digital attention.</h2>
          <p>
            The modern internet is flooded with banner ads that get blocked, popups that annoy you, and empty corporate promises.
            We wanted to build something fun instead: <em>What if exploring a brand felt like exploring an interactive 3D museum?</em>
          </p>
          <p>
            No 50GB downloads. No crypto wallet wall before you can play. Just a living, multiplayer world running directly in your browser,
            where curious people explore, solve clues, and discover real rewards hidden by real brands.
          </p>
          <div className="founder-quote-card">
            <p>
              “Can a browser-based museum turn into the internet’s favorite treasure hunt? Step inside and find the clues for yourself.”
            </p>
            <span className="founder-signoff">— The Any30 Curators</span>
          </div>
        </div>
      </section>

      {/* Active Gifts Vault Section */}
      <section className="vault-section" id="vault" aria-labelledby="vault-title">
        <div className="vault-container">
          <div className="vault-header">
            <div className="vault-header-lead">
              <div className="vault-telemetry-badge">
                <span className="telemetry-dot" />
                <span className="telemetry-label">REGISTRY // 02 · VERIFIED INVENTORY</span>
              </div>
              <h2 id="vault-title" className="vault-title">Current Active Gifts to Discover</h2>
              <p className="vault-subtitle">
                Inspect physical 3D exhibits inside the museum corridors to unlock verified vouchers into your passport inventory. 100% free to claim upon discovery.
              </p>
            </div>
            <div className="vault-meta-summary">
              <div className="vault-stat-item">
                <span className="vault-stat-num">4</span>
                <span className="vault-stat-label">Active Gifts Online</span>
              </div>
              <div className="vault-stat-divider" />
              <div className="vault-stat-item">
                <span className="vault-stat-num">FREE</span>
                <span className="vault-stat-label">Zero Entry or Claim Fees</span>
              </div>
            </div>
          </div>

          <div className="vault-grid">
            {activeRewards.map((reward) => (
              <article key={reward.id} className="vault-card">
                <div className="vault-card-topbar">
                  <span className="vault-card-ref">{reward.id}</span>
                  <span className="vault-card-status">
                    <span className="status-ping-dot" />
                    {reward.badge}
                  </span>
                </div>

                <div className="vault-card-body">
                  <span className="vault-card-tier">{reward.tier}</span>
                  <h3 className="vault-card-title">{reward.title}</h3>
                  <div className="vault-card-value">{reward.value}</div>
                </div>

                <div className="vault-card-specs">
                  <div className="vault-spec-row">
                    <span className="vault-spec-key">SPONSOR</span>
                    <span className="vault-spec-val">{reward.sponsor}</span>
                  </div>
                  <div className="vault-spec-row">
                    <span className="vault-spec-key">LOCATION</span>
                    <span className="vault-spec-val">{reward.location}</span>
                  </div>
                </div>

                <div className="vault-card-intel">
                  <Compass size={14} className="vault-intel-icon" />
                  <p className="vault-intel-text">{reward.hint}</p>
                </div>

                <div className="vault-card-footer">
                  <button onClick={onEnter} className="vault-locate-btn">
                    <span>Locate In Museum</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Showcase */}
      <section className="worlds-section" id="worlds" aria-labelledby="worlds-title">
        <div className="worlds-heading">
          <div><span className="kicker">WORLDS &amp; EXPERIENCES</span><h2 id="worlds-title">Choose your destination.</h2></div>
          <p>Each Any30 world has its own terrain, challenges, and rewards. Jump in now.</p>
        </div>

        <div className="world-catalogue">
          <article className="world-card world-card--live">
            <div className="world-card-media">
              <img src={museumCoverImage} alt="Inside the Any30 Museum of Gifts — glowing exhibits and explorers" />
              <div className="world-badges"><span className="world-badge world-badge--live">Live now</span><span className="world-index">Experience 001</span></div>
            </div>
            <div className="world-card-body">
              <div className="world-type"><Compass size={16}/><span>Explore · Inspect · Discover</span></div>
              <h3>The Museum of Gifts</h3>
              <p>Walk through three distinct wings, inspect exhibits, solve interactive puzzles, and fill your passport with real rewards.</p>
              <div className="world-facts"><span>3 galleries</span><span>6 exhibits</span><span>{stats.museumPlays.toLocaleString()} explorers played</span></div>
              <button className="world-enter cursor-pointer" onClick={onEnter}>Enter the Museum <ArrowRight size={18}/></button>
            </div>
          </article>

          <article className="world-card world-card--upcoming">
            <div className="world-card-media">
              <img src={touchGrassImage} alt="Concept preview of explorers crossing a forest obstacle course" />
              <div className="world-badges"><span className="world-badge world-badge--coming-soon"><Lock size={11}/> Coming Soon</span><span className="world-index">Experience 002</span></div>
            </div>
            <div className="world-card-body">
              <div className="world-type"><Leaf size={16}/><span>Run · Climb · Compete</span></div>
              <h3>Canopy Run</h3>
              <p>Leave the desk behind and race through a fast-paced forest canopy obstacle course where shortcuts and timing decide the prize.</p>
              <div className="world-facts"><span>Nature course</span><span>Skill-based</span><span>Speed challenge</span></div>
              <div className="world-enter world-enter--disabled"><Lock size={16}/> Coming Soon</div>
            </div>
          </article>
        </div>
      </section>

      {/* Brand & Sponsor Callout */}
      <section className="sponsor-cta-banner">
        <div className="sponsor-cta-inner">
          <div className="sponsor-copy">
            <span className="kicker">WANT TO FEATURE YOUR BRAND?</span>
            <h2>Hide your gift or book a digital billboard.</h2>
            <p>
              Thousands of players actively inspect our 3D exhibits looking for clues.
              Sponsor a reward or reserve prime digital signage ad spaces in our high-traffic corridors.
            </p>
          </div>
          <a href="/partners" className="sponsor-btn">
            Explore /partners Hub <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="questions" aria-labelledby="faq-title">
        <div><span className="kicker">FREQUENTLY ASKED QUESTIONS</span><h2 id="faq-title">Everything you need to know.</h2></div>
        <div className="faq-list">
          {questions.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="brand-mark"><span className="brand-glyph"><span /></span><span>Any30</span></div>
        <p>The Playable Museum of Gifts · Built for real internet explorers.</p>
        <div className="footer-meta">
          <span>© 2026 Any30</span>
          <a href="/partners">Partners &amp; Ad Spaces</a>
          <button onClick={() => setIsTokenModalOpen(true)} className="footer-link-btn">Token Policy</button>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>

      {/* Token Transparency Modal */}
      {isTokenModalOpen && (
        <TokenTransparencyModal onClose={() => setIsTokenModalOpen(false)} />
      )}
    </main>
  );
};

export default LandingPage;
