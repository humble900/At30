import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Gift,
  MapPin,
  Send,
  ShieldCheck,
  Tv
} from 'lucide-react';
import { INITIAL_PUBLIC_PARTNERS, partnerInquiries, type PartnerType } from '../services/PartnerInquiryService';
import './PartnersPage.css';

export const PartnersPage: React.FC = () => {
  const [partnerType, setPartnerType] = useState<PartnerType>('sponsor_gift');
  const [brandName, setBrandName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [clueIdea, setClueIdea] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Partner & Sponsor Hub — Any30 | In-World 3D Metaverse Advertising';
    
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaDesc?.content;
    if (metaDesc) {
      metaDesc.content = 'Display sponsored gifts or book high-visibility 3D virtual signage in the Any30 Museum. Drive 5+ minutes of active brand dwell time.';
    }

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute('href');
    canonical?.setAttribute('href', 'https://any30.com/partners');

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.content = prevDesc;
      if (canonical && prevCanonical) canonical.setAttribute('href', prevCanonical);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !contactEmail || !websiteUrl || !offerDescription) return;

    setIsSubmitting(true);
    const res = await partnerInquiries.submitInquiry({
      brandName,
      contactEmail,
      contactPhone: contactPhone || undefined,
      websiteUrl,
      logoUrl: logoUrl || undefined,
      partnerType,
      offerDescription,
      estimatedValue: estimatedValue || undefined,
      clueIdea: clueIdea || undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      setSubmittedMessage(res.message);
      setBrandName('');
      setContactEmail('');
      setContactPhone('');
      setWebsiteUrl('');
      setLogoUrl('');
      setOfferDescription('');
      setEstimatedValue('');
      setClueIdea('');
    }
  };

  return (
    <div className="partners-shell">
      {/* Navigation matching Landing Page */}
      <header className="partners-nav">
        <a href="/" className="brand-mark">
          <div className="brand-glyph"><span /></div>
          <span>Any30</span>
        </a>

        <div className="partners-nav-badge">
          <span className="kicker">PARTNER &amp; SPONSOR PROGRAM</span>
        </div>

        <div className="partners-nav-actions">
          <a href="/" className="text-link">
            <ArrowLeft size={14} /> Back to Museum
          </a>
          <a href="#apply" className="nav-cta">
            Apply Now <ArrowRight size={14} />
          </a>
        </div>
      </header>

      {/* Hero Section matching Landing Page */}
      <section className="partners-hero">
        <div className="partners-hero-copy">
          <h1>
            Don’t buy ads people ignore.<br />
            <em>Display your product inside our museum.</em>
          </h1>
          <p>
            Traditional internet ads get skipped in milliseconds. In Any30, players explore 3D multiplayer gallery halls, inspect exhibits, and spend 5+ minutes actively discovering your verified discount, voucher, or digital gift.
          </p>

          <div className="hero-actions">
            <a href="#apply" className="primary-cta">
              <span className="cta-icon"><Gift size={18} /></span>
              <span>Display a Sponsored Gift</span>
            </a>
            <a href="#directory" className="text-link">
              View Active Registry <ArrowRight size={14} />
            </a>
          </div>

          <div className="hero-social-proof">
            <div className="proof-pill">
              <span className="live-indicator">
                <span className="live-pulse" />
                <span className="live-dot" />
              </span>
              <span><strong>5+ Min</strong> Active Dwell Time</span>
            </div>
            <div className="proof-pill proof-pill--secondary">
              <span><strong>100%</strong> Proximity Discovery</span>
            </div>
            <div className="proof-pill proof-pill--secondary">
              <span><strong>0%</strong> Ad-Blocker Interference</span>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Models / Tiers matching Landing Page Experience Grid */}
      <section className="partners-tiers-section">
        <div className="section-heading">
          <div>
            <span className="kicker">INTEGRATION MODELS</span>
            <h2>Two Ways to Partner With Any30</h2>
          </div>
          <p>Choose between gamified gift placement inside interactive 3D exhibits or high-visibility virtual signage.</p>
        </div>

        <div className="tiers-grid">
          {/* Tier 1: Reward Sponsor */}
          <article className="tier-card">
            <div className="tier-card-top">
              <span className="tier-pill">TIER 01 // GIFT SPONSOR</span>
              <Gift size={22} className="tier-icon" />
            </div>
            <h3>In-World Gift Sponsorship</h3>
            <p>
              Have a SaaS tier, developer API credit, indie game license, or exclusive voucher? We integrate your offering as an encrypted interactive artifact inside the museum. Visitors solve riddles to claim it directly into their passport inventory.
            </p>
            <ul className="tier-perks">
              <li><CheckCircle2 size={16} /> Featured inside visitor passport &amp; completion registry</li>
              <li><CheckCircle2 size={16} /> Physical 3D exhibit inspection (proximity trigger + riddle solving)</li>
              <li><CheckCircle2 size={16} /> 100% voluntary discovery: visitors celebrate unlocking your brand</li>
            </ul>
            <a href="#apply" onClick={() => setPartnerType('sponsor_gift')} className="tier-cta-btn">
              Configure Gift Sponsorship <ArrowRight size={14} />
            </a>
          </article>

          {/* Tier 2: 3D Signage */}
          <article className="tier-card">
            <div className="tier-card-top">
              <span className="tier-pill">TIER 02 // SIGNAGE ADVERTISER</span>
              <Tv size={22} className="tier-icon" />
            </div>
            <h3>3D Virtual Signage &amp; Billboards</h3>
            <p>
              Book dedicated billboard screens, entrance totems, and hallway canvases. Your brand is rendered on high-resolution virtual 3D displays with real-time multiplayer impressions and outbound click attribution.
            </p>
            <ul className="tier-perks">
              <li><CheckCircle2 size={16} /> Prime corridor &amp; entrance totem positioning</li>
              <li><CheckCircle2 size={16} /> Direct 1-click outbound link with telemetry attribution</li>
              <li><CheckCircle2 size={16} /> WebGL native rendering: zero external iframes or slow embeds</li>
            </ul>
            <a href="#apply" onClick={() => setPartnerType('digital_signage')} className="tier-cta-btn">
              Book Signage Placement <ArrowRight size={14} />
            </a>
          </article>
        </div>
      </section>

      {/* Compliance Charter */}
      <section className="charter-section">
        <div className="charter-inner">
          <div className="charter-header">
            <ShieldCheck size={28} />
            <div>
              <span className="kicker">COMPLIANCE CHARTER</span>
              <h2>Partner Standards &amp; Reward Integrity</h2>
              <p>We respect our visitors. Every displayed gift and sponsored showcase must adhere to our verification baseline:</p>
            </div>
          </div>

          <div className="charter-columns">
            <div className="charter-col">
              <span className="charter-num">01</span>
              <h4>Verifiable Value Only</h4>
              <p>No inflated fake retail values with hidden catches. Gifts must represent genuine discounts, valid license keys, or real digital assets.</p>
            </div>
            <div className="charter-col">
              <span className="charter-num">02</span>
              <h4>Instant Digital Fulfillment</h4>
              <p>Items must be immediately redeemable via digital code, key, or authenticated URL in the user's passport upon solving.</p>
            </div>
            <div className="charter-col">
              <span className="charter-num">03</span>
              <h4>Public Brand Ledger</h4>
              <p>Every accepted sponsor is credited publicly in our directory with official links and social profiles so explorers can patronize you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="partners-directory-section" id="directory">
        <div className="section-heading">
          <div>
            <span className="kicker">PUBLIC DIRECTORY</span>
            <h2>Current Partners &amp; Open Placements</h2>
          </div>
          <p>Explore verified brands currently active in the Any30 ecosystem, or reserve an unallocated placement.</p>
        </div>

        <div className="directory-grid">
          {INITIAL_PUBLIC_PARTNERS.map((p) => (
            <article key={p.id} className={`directory-card ${p.isAvailableSlot ? 'directory-card--available' : ''}`}>
              <div className="directory-card-top">
                <span className="directory-avatar">{p.logoText}</span>
                <span className={`directory-badge ${p.isAvailableSlot ? 'directory-badge--open' : ''}`}>
                  {p.badge}
                </span>
              </div>
              <h4>{p.name}</h4>
              <p className="directory-tagline">{p.tagline}</p>
              <div className="directory-offer-box">
                <span className="kicker">OFFER / PAYLOAD</span>
                <strong>{p.giftOffer}</strong>
              </div>
              <div className="directory-location">
                <MapPin size={13} />
                <span>{p.locationInMuseum}</span>
              </div>
              <div className="directory-action">
                {p.isAvailableSlot ? (
                  <a href="#apply" className="directory-claim-link">
                    Reserve Slot <ArrowRight size={13} />
                  </a>
                ) : (
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="directory-visit-link">
                    Visit Partner <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Application Form Section */}
      <section className="partners-form-section" id="apply">
        <div className="form-card">
          <div className="form-intro">
            <span className="kicker">APPLICATION CONSOLE</span>
            <h2>Apply to Sponsor a Gift or Reserve Signage</h2>
            <p>Tell us what you'd like to feature. Our curation team evaluates submissions within 24 hours.</p>
          </div>

          {submittedMessage ? (
            <div className="form-success-alert">
              <CheckCircle2 size={36} color="#10B981" />
              <h3>Application Submitted Successfully</h3>
              <p>{submittedMessage}</p>
              <button onClick={() => setSubmittedMessage(null)} className="form-reset-btn">
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="partner-form">
              <div className="form-type-selector">
                <button
                  type="button"
                  className={`type-tab ${partnerType === 'sponsor_gift' ? 'type-tab--active' : ''}`}
                  onClick={() => setPartnerType('sponsor_gift')}
                >
                  <Gift size={15} />
                  <span>TIER 01: IN-WORLD GIFT DISPLAY</span>
                </button>
                <button
                  type="button"
                  className={`type-tab ${partnerType === 'digital_signage' ? 'type-tab--active' : ''}`}
                  onClick={() => setPartnerType('digital_signage')}
                >
                  <Tv size={15} />
                  <span>TIER 02: 3D SIGNAGE ADVERTISER</span>
                </button>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Brand / Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Cloud or Indie Game Studios"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Official Website or Profile URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://yourbrand.com or https://x.com/handle"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="partnerships@yourbrand.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Contact Phone / WhatsApp (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Logo Asset URL (Optional vector or high-res PNG)</label>
                <input
                  type="url"
                  placeholder="https://yourbrand.com/logo.svg"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  {partnerType === 'sponsor_gift'
                    ? 'Gift Specification & Delivery Method *'
                    : 'Digital Billboard Promotion Specification *'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    partnerType === 'sponsor_gift'
                      ? 'e.g. 50 voucher keys for 6 months complimentary pro tier, or $50 digital credits with instant redemption.'
                      : 'e.g. High-resolution canvas ad promoting our developer IDE with outbound link to documentation.'
                  }
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label>Estimated Value / Details (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. $100 value per claim or 30% subscription discount"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Exhibit Riddle / Discovery Clue Idea (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 'Search behind the server matrix in East Wing...'"
                    value={clueIdea}
                    onChange={(e) => setClueIdea(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="form-submit-cta">
                {isSubmitting ? (
                  'Submitting Application...'
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Partner Application</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer matching Landing Page */}
      <footer className="landing-footer">
        <a href="/" className="brand-mark">
          <div className="brand-glyph"><span /></div>
          <span>Any30</span>
        </a>
        <p>© 2026 Any30 Museum Protocol. All rights reserved.</p>
        <div className="footer-meta">
          <a href="/">Home</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default PartnersPage;
