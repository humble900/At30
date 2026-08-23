import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronRight,
  Compass,
  Gamepad2,
  Globe2,
  ShieldCheck,
  User,
  Palette
} from 'lucide-react';
import heroImage from '../assets/hero.png';
import './LandingPage.css';

type LandingPageProps = {
  savedName: string;
  savedColor: string;
  onEnter: () => void;
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

export const LandingPage: React.FC<LandingPageProps> = ({
  savedName,
  savedColor,
  onEnter,
  onRequestCustomize
}) => {
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Primary navigation">
        <a className="brand-mark" href="#top" aria-label="AT30 home">
          <span className="brand-glyph"><span /></span>
          <span>AT30</span>
        </a>
        <div className="nav-links">
          <a href="#experience">Experience</a>
          <a href="#partner-roster">Partners</a>
          <a href="#enterprise">For enterprise</a>
        </div>
        
        <div className="flex items-center gap-2.5">
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
            Enter museum <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <section className="landing-hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">AT30 DIGITAL MUSEUM</div>
          <h1>Explore the<br /><em>collection.</em></h1>
          <p>
            Walk through three brand galleries, inspect six exhibits, solve the clues,
            and collect the rewards hidden inside.
          </p>
          <div className="hero-actions">
            <button className="primary-cta cursor-pointer" onClick={onEnter}>
              <span className="cta-icon"><Gamepad2 size={19} /></span>
              <span>Start Exploring as {savedName || 'Curator'}</span>
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
              <span>INTERACTIVE EXHIBITION</span>
              <span>AT30 / 001</span>
            </div>
            <img src={heroImage} alt="AT30 museum curator avatar" />
            <div className="card-caption">
              <div><small>CURRENT EXHIBITION</small><strong>The Future, Curated.</strong></div>
              <Compass size={24} />
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" id="partner-roster">
        <span>Current exhibition partners</span>
        <div>{partners.map((partner) => <strong key={partner}>{partner}</strong>)}</div>
      </section>

      <section className="experience-section" id="experience">
        <div className="section-heading">
          <div><span className="kicker">THE COLLECTION</span><h2>Three wings to explore.</h2></div>
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
          <span className="kicker">PARTNER WITH AT30</span>
          <h2>Build a brand experience people can enter.</h2>
          <p>AT30 turns product stories into explorable spaces. Partners can own a gallery, launch an interactive exhibit, or place a campaign at the museum reception.</p>
          <div className="partner-status"><span>2026 partner programme</span><strong>Now reviewing briefs</strong></div>
        </div>
        <div className="enterprise-copy">
          <div className="partner-offerings">
            <article><span>01</span><div><h3>Branded gallery</h3><p>A dedicated environment shaped around your product, category, and visual identity.</p></div></article>
            <article><span>02</span><div><h3>Interactive activation</h3><p>Playable product stories, discoveries, and rewards designed for repeat visits.</p></div></article>
            <article><span>03</span><div><h3>Reception media</h3><p>High-visibility placement at the shared entrance where every museum visit begins.</p></div></article>
          </div>
          <div className="partner-delivery"><BarChart3 size={19}/><p><strong>Built for accountable campaigns.</strong><span>Placement scope, interaction goals, and launch requirements are agreed before production.</span></p></div>
          <button className="light-cta cursor-pointer" onClick={onEnter}>View the live experience <ArrowRight size={18} /></button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand-mark"><span className="brand-glyph"><span /></span><span>AT30</span></div>
        <p>Three galleries. Six exhibits. Three rewards.</p>
        <span>© 2026 AT30</span>
      </footer>
    </main>
  );
};
