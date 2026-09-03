import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronRight,
  Compass,
  Gamepad2,
  Globe2,
  Leaf,
  ShieldCheck,
  User,
  Palette
} from 'lucide-react';
import heroImage from '../assets/hero.png';
import touchGrassImage from '../assets/touch-grass-preview.webp';
import { visitorStats, type PlatformPublicStats } from '../services/VisitorStatsService';
import './LandingPage.css';

type LandingPageProps = {
  savedName: string;
  savedColor: string;
  onEnter: () => void;
  onEnterCanopy: () => void;
  onRequestCustomize: () => void;
};


const partners = ['PosterBooking', 'ClayRent', 'LeadMagic', 'AT30 Labs'];

const experiences = [
  {
    number: '01',
    title: 'Digital Canvas Wing',
    company: 'PosterBooking',
    description: 'Explore responsive displays and decode the signal hidden inside the gallery.',
    accent: '#51c7ff',
    icon: Globe2,
  },
  {
    number: '02',
    title: 'Modern Habitat',
    company: 'ClayRent',
    description: 'Step inside a premium spatial showcase built around modern rental experiences.',
    accent: '#ffb86c',
    icon: Building2,
  },
  {
    number: '03',
    title: 'Intelligence Vault',
    company: 'LeadMagic',
    description: 'Trace visitor signals and uncover the code hidden inside the intelligence chamber.',
    accent: '#a98cff',
    icon: ShieldCheck,
  },
];

const questions = [
  { question: 'What is AT30?', answer: 'AT30 is a browser-based platform for seasonal multiplayer events and games. The Digital Museum is Experience 001—the first live world on the platform.' },
  { question: 'Do I need to download an app?', answer: 'No. AT30 runs in a modern web browser on supported phones, tablets, and computers.' },
  { question: 'Can I play with other people?', answer: 'Yes. AT30 experiences are designed to be social. In the Digital Museum, connected visitors can see nearby players and use short, proximity-based speech bubbles.' },
  { question: 'What can I play now?', answer: 'The first live experience is AT30 Digital Museum. Choose an avatar, explore three brand galleries, inspect exhibits, solve clues, and collect rewards.' },
  { question: 'Can my company host an event or game?', answer: 'Yes. AT30 works with organisations to create hosted events, seasonal games, launches, and persistent branded experiences shaped around their audience and goals.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  savedName,
  savedColor,
  onEnter,
  onEnterCanopy,
  onRequestCustomize
}) => {
  const [stats, setStats] = useState<PlatformPublicStats>(() => visitorStats.getStats());

  useEffect(() => {
    void visitorStats.recordSiteVisit().then(setStats);
    const unsubscribe = visitorStats.subscribe(setStats);
    return unsubscribe;
  }, []);

  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Primary navigation">
        <a className="brand-mark" href="#top" aria-label="AT30 home">
          <span className="brand-glyph"><span /></span>
          <span>AT30</span>
        </a>
        <div className="nav-links">
          <a href="#worlds">Experiences</a>
          <a href="#partner-roster">Partners</a>
          <a href="#enterprise">Host on AT30</a>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="nav-stats-chip hidden md:inline-flex" title="Total public visitors who have explored the AT30 platform">
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
            Play now <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <section className="landing-hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">SEASONAL WORLDS · EVENTS · GAMES</div>
          <h1>Enter the next<br /><em>experience.</em></h1>
          <p>
            Step into new worlds, explore with others, follow clues, and find hidden rewards.
            Some worlds stay for a season. Others grow into something bigger.
            <span className="hero-next-world">Start with the AT30 Digital Museum. The next world could take you anywhere.</span>
          </p>

          <div className="hero-social-proof" aria-label="Live platform statistics">
            <div className="proof-pill">
              <span className="live-indicator">
                <span className="live-pulse" />
                <span className="live-dot" />
              </span>
              <Globe2 size={15} className="text-cyan-600" />
              <span><strong>{stats.totalVisitors.toLocaleString()}</strong> people have visited AT30</span>
            </div>
            <div className="proof-pill proof-pill--secondary">
              <Gamepad2 size={15} className="text-emerald-600" />
              <span><strong>{stats.totalGamePlays.toLocaleString()}</strong> games played</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="primary-cta cursor-pointer" onClick={onEnter}>
              <span className="cta-icon"><Gamepad2 size={19} /></span>
              <span>Play Digital Museum as {savedName || 'Curator'}</span>
              <ArrowRight size={18} />
            </button>
            <button className="text-link cursor-pointer flex items-center gap-1" onClick={onRequestCustomize}>
              <User size={15} /> Customize Avatar <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Preview of the AT30 digital museum">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="visual-halo" />
          <div className="museum-card">
            <div className="card-topline">
              <span>LIVE EXPERIENCE</span>
              <span>AT30 / 001</span>
            </div>
            <img src={heroImage} alt="AT30 museum curator avatar" />
            <div className="card-caption">
              <div><small>EXPERIENCE 001 · LIVE NOW</small><strong>AT30 Digital Museum</strong></div>
              <Compass size={24} />
            </div>
          </div>
        </div>
      </section>

      <section className="worlds-section" id="worlds" aria-labelledby="worlds-title">
        <div className="worlds-heading">
          <div><span className="kicker">AT30 EXPERIENCES</span><h2 id="worlds-title">Choose your next world.</h2></div>
          <p>Each AT30 experience has its own place, story, and way to play. Enter what is live now and see what we are building next.</p>
        </div>

        <div className="world-catalogue">
          <article className="world-card world-card--live">
            <div className="world-card-media">
              <img src={heroImage} alt="Curator standing inside AT30 Digital Museum" />
              <div className="world-badges"><span className="world-badge world-badge--live">Live now</span><span className="world-index">Experience 001</span></div>
            </div>
            <div className="world-card-body">
              <div className="world-type"><Compass size={16}/><span>Explore · Inspect · Discover</span></div>
              <h3>AT30 Digital Museum</h3>
              <p>Walk through three galleries, uncover the stories behind each exhibit, follow the clues, and collect the rewards hidden inside.</p>
              <div className="world-facts"><span>3 galleries</span><span>6 exhibits</span><span>{stats.museumPlays.toLocaleString()} explorers played</span></div>
              <button className="world-enter cursor-pointer" onClick={onEnter}>Enter the museum <ArrowRight size={18}/></button>

            </div>
          </article>

          <article className="world-card world-card--upcoming">
            <div className="world-card-media">
              <img src={touchGrassImage} alt="Concept preview of explorers crossing a forest obstacle course" />
              <div className="world-badges"><span className="world-badge world-badge--live">Play the course</span><span className="world-index">Experience 002</span></div>
            </div>
            <div className="world-card-body">
              <div className="world-type"><Leaf size={16}/><span>Run · Climb · Compete</span></div>
              <h3>Canopy Run</h3>
              <p>Leave the desk behind and take on a fast forest course where timing, movement, and bold shortcuts decide your place.</p>
              <div className="world-facts"><span>Nature course</span><span>Skill-based</span><span>Seasonal</span></div>
              <button className="world-enter cursor-pointer" onClick={onEnterCanopy}>Enter Canopy Run <ArrowRight size={18}/></button>
            </div>
          </article>
        </div>

        <div className="worlds-note"><span>001 is open</span><p>New places will join AT30 over time. Every experience gets its own entrance, identity, and reason to return.</p></div>
      </section>

      <section className="trust-strip" id="partner-roster">
        <span>Experience 001 partners</span>
        <div>{partners.map((partner) => <strong key={partner}>{partner}</strong>)}</div>
      </section>

      <section className="experience-section" id="experience">
        <div className="section-heading">
          <div><span className="kicker">INSIDE EXPERIENCE 001</span><h2>Three wings to explore.</h2></div>
          <p>Each wing has two exhibits and one reward. Walk up to an exhibit and inspect it to reveal the story and its clue.</p>
        </div>
        <div className="experience-grid">
          {experiences.map(({ icon: Icon, ...item }) => (
            <article className="experience-card" key={item.number} style={{ '--card-accent': item.accent } as React.CSSProperties}>
              <div className="experience-card-top"><span>{item.number}</span><Icon size={24} /></div>
              <small>{item.company}</small>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button onClick={onEnter} className="cursor-pointer" aria-label={`Explore ${item.title}`}><ArrowRight size={18} /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="enterprise-section" id="enterprise">
        <div className="enterprise-intro">
          <span className="kicker">HOST ON AT30</span>
          <h2>Turn your next moment into a world.</h2>
          <p>AT30 creates multiplayer events and games around your audience, season, or launch—from a limited-time activation to a company-owned experience that can keep evolving.</p>
          <div className="partner-status"><span>2026 partner programme</span><strong>Now reviewing briefs</strong></div>
        </div>
        <div className="enterprise-copy">
          <div className="partner-offerings">
            <article><span>01</span><div><h3>Hosted event</h3><p>A shared destination for launches, celebrations, community gatherings, and time-bound campaigns.</p></div></article>
            <article><span>02</span><div><h3>Seasonal game</h3><p>A replayable multiplayer challenge with discoveries, social moments, rewards, and measurable goals.</p></div></article>
            <article><span>03</span><div><h3>Company-owned world</h3><p>A distinctive experience built around your identity and designed to expand across future seasons.</p></div></article>
          </div>
          <div className="partner-delivery"><BarChart3 size={19}/><p><strong>Designed to launch, measure, and evolve.</strong><span>Audience, gameplay loop, moderation, success metrics, and seasonal roadmap are defined before production.</span></p></div>
          <button className="light-cta cursor-pointer" onClick={onEnter}>View the live experience <ArrowRight size={18} /></button>
        </div>
      </section>

      <section className="faq-section" id="questions" aria-labelledby="faq-title">
        <div><span className="kicker">AT30 PLATFORM</span><h2 id="faq-title">Play now. More worlds next.</h2></div>
        <div className="faq-list">
          {questions.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand-mark"><span className="brand-glyph"><span /></span><span>AT30</span></div>
        <p>Seasonal events and games, built to bring people together.</p>
        <div className="footer-meta"><span>© 2026 AT30</span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
      </footer>
    </main>
  );
};
